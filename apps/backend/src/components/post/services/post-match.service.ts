import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DataSource } from 'typeorm';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { ChatGateway } from '~/components/chat/gateways/chat.gateway';
import { ChatService } from '~/components/chat/services/chat.service';
import { NotificationService } from '~/components/notification/services/notification.service';
import { PostMatchEntity } from '~/entities/post-match.entity';
import { PostEntity } from '~/entities/post.entity';
import { PostMatchRepository } from '~/repositories/post-match.repository';
import { PostRepository } from '~/repositories/post.repository';
import { POST_MATCH_STATUS, POST_STATUS } from '../constants/post.constant';

@Injectable()
export class PostMatchService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly postRepository: PostRepository,
    private readonly postMatchRepository: PostMatchRepository,
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
    private readonly notificationService: NotificationService,
  ) {}

  async applyMatch(
    postId: string,
    applicantId: string,
  ): Promise<PostMatchEntity> {
    const post = await this.postRepository.findById(postId);
    if (!post || post.deletedAt) {
      throw new ApplicationException({
        code: 'POST_NOT_FOUND',
        messageKey: 'error.postNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    if (post.status !== POST_STATUS.OPEN) {
      throw new ApplicationException({
        code: 'POST_NOT_OPEN',
        messageKey: 'error.postNotOpen',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    if (post.userId === applicantId) {
      throw new ApplicationException({
        code: 'CANNOT_APPLY_OWN_POST',
        messageKey: 'error.cannotApplyOwnPost',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const existingMatch = await this.postMatchRepository.findByPostAndApplicant(
      postId,
      applicantId,
    );

    if (existingMatch) {
      if (
        existingMatch.status === POST_MATCH_STATUS.PENDING ||
        existingMatch.status === POST_MATCH_STATUS.ACCEPTED
      ) {
        throw new ApplicationException({
          code: 'ALREADY_APPLIED',
          messageKey: 'error.alreadyApplied',
          status: HttpStatus.BAD_REQUEST,
        });
      }

      existingMatch.status = POST_MATCH_STATUS.PENDING;
      const saved = await this.postMatchRepository.save(existingMatch);

      await this.notificationService.createAndSend({
        userId: post.userId,
        type: 'match_request',
        title: 'Yêu cầu ghép trận mới',
        content: `Có người muốn bắt đối cho bài viết "${post.title}".`,
        refId: saved.id,
        link: '/messages',
      });

      return saved;
    }

    const match = this.postMatchRepository.create({
      id: randomUUID(),
      postId,
      applicantId,
      status: POST_MATCH_STATUS.PENDING,
      conversationId: null,
    });

    const saved = await this.postMatchRepository.save(match);

    await this.notificationService.createAndSend({
      userId: post.userId,
      type: 'match_request',
      title: 'Yêu cầu ghép trận mới',
      content: `Có người muốn bắt đối cho bài viết "${post.title}".`,
      refId: saved.id,
      link: '/messages',
    });

    return saved;
  }

  async getPostMatches(
    postId: string,
    userId: string,
  ): Promise<PostMatchEntity[]> {
    const post = await this.postRepository.findById(postId);
    if (!post || post.deletedAt) {
      throw new ApplicationException({
        code: 'POST_NOT_FOUND',
        messageKey: 'error.postNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    if (post.userId === userId) {
      return this.postMatchRepository.findByPostId(postId);
    }

    const myMatch = await this.postMatchRepository.findByPostAndApplicant(
      postId,
      userId,
    );
    return myMatch ? [myMatch] : [];
  }

  async acceptMatch(
    postId: string,
    matchId: string,
    userId: string,
  ): Promise<PostMatchEntity> {
    const { acceptedMatch, post } = await this.dataSource.transaction(
      async (manager) => {
        const p = await manager
          .getRepository(PostEntity)
          .createQueryBuilder('post')
          .setLock('pessimistic_write')
          .where('post.id = :id', { id: postId })
          .andWhere('post.deletedAt IS NULL')
          .getOne();

        if (!p) {
          throw new ApplicationException({
            code: 'POST_NOT_FOUND',
            messageKey: 'error.postNotFound',
            status: HttpStatus.NOT_FOUND,
          });
        }

        if (p.userId !== userId) {
          throw new ApplicationException({
            code: 'FORBIDDEN_MATCH_ACTION',
            messageKey: 'error.forbiddenMatchAction',
            status: HttpStatus.FORBIDDEN,
          });
        }

        if (p.status !== POST_STATUS.OPEN || p.currentPlayers >= p.maxPlayers) {
          throw new ApplicationException({
            code: 'MAX_PLAYERS_REACHED',
            messageKey: 'error.maxPlayersReached',
            status: HttpStatus.BAD_REQUEST,
          });
        }

        const match = await manager
          .getRepository(PostMatchEntity)
          .findOne({ where: { id: matchId, postId } });

        if (!match) {
          throw new ApplicationException({
            code: 'MATCH_NOT_FOUND',
            messageKey: 'error.matchNotFound',
            status: HttpStatus.NOT_FOUND,
          });
        }

        if (match.status === POST_MATCH_STATUS.ACCEPTED) {
          throw new ApplicationException({
            code: 'MATCH_ALREADY_ACCEPTED',
            messageKey: 'error.matchAlreadyAccepted',
            status: HttpStatus.BAD_REQUEST,
          });
        }

        if (match.status !== POST_MATCH_STATUS.PENDING) {
          throw new ApplicationException({
            code: 'MATCH_ALREADY_PROCESSED',
            messageKey: 'error.matchAlreadyProcessed',
            status: HttpStatus.BAD_REQUEST,
          });
        }

        match.status = POST_MATCH_STATUS.ACCEPTED;
        const savedMatch = await manager.save(PostMatchEntity, match);

        p.currentPlayers += 1;
        if (p.currentPlayers >= p.maxPlayers) {
          p.status = POST_STATUS.MATCHED;
        }
        const savedPost = await manager.save(PostEntity, p);

        return { acceptedMatch: savedMatch, post: savedPost };
      },
    );

    try {
      const { conversation, message } =
        await this.chatService.createMatchConversation(
          post.id,
          post.userId,
          acceptedMatch.applicantId,
          post.title,
        );

      acceptedMatch.conversationId = conversation.id;
      await this.postMatchRepository.save(acceptedMatch);

      this.chatGateway.emitToConversation(
        conversation.id,
        'receive_message',
        message,
      );
      this.chatGateway.emitToUsers(
        [post.userId, acceptedMatch.applicantId],
        'match:accepted',
        {
          matchId: acceptedMatch.id,
          postId: post.id,
          conversationId: conversation.id,
          postTitle: post.title,
        },
      );

      await this.notificationService.createAndSend({
        userId: acceptedMatch.applicantId,
        type: 'match_confirmed',
        title: 'Ghép trận thành công',
        content: `Yêu cầu ghép trận cho bài viết "${post.title}" đã được chấp thuận.`,
        refId: conversation.id,
        link: '/messages',
      });
    } catch {
      // Non-blocking chat/notification fallback
    }

    return acceptedMatch;
  }

  async rejectMatch(
    postId: string,
    matchId: string,
    userId: string,
  ): Promise<PostMatchEntity> {
    const post = await this.postRepository.findById(postId);
    if (!post || post.deletedAt) {
      throw new ApplicationException({
        code: 'POST_NOT_FOUND',
        messageKey: 'error.postNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    if (post.userId !== userId) {
      throw new ApplicationException({
        code: 'FORBIDDEN_MATCH_ACTION',
        messageKey: 'error.forbiddenMatchAction',
        status: HttpStatus.FORBIDDEN,
      });
    }

    const match = await this.postMatchRepository.findById(matchId);
    if (!match || match.postId !== postId) {
      throw new ApplicationException({
        code: 'MATCH_NOT_FOUND',
        messageKey: 'error.matchNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    match.status = POST_MATCH_STATUS.REJECTED;
    return this.postMatchRepository.save(match);
  }

  async cancelMatch(postId: string, applicantId: string): Promise<void> {
    const match = await this.postMatchRepository.findByPostAndApplicant(
      postId,
      applicantId,
    );
    if (!match) {
      throw new ApplicationException({
        code: 'MATCH_NOT_FOUND',
        messageKey: 'error.matchNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    if (match.status !== POST_MATCH_STATUS.PENDING) {
      throw new ApplicationException({
        code: 'MATCH_CANNOT_CANCEL',
        messageKey: 'error.matchCannotCancel',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    match.status = POST_MATCH_STATUS.CANCELLED;
    await this.postMatchRepository.save(match);
  }
}
