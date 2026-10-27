import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ChatGateway } from '~/components/chat/gateways/chat.gateway';
import { ChatService } from '~/components/chat/services/chat.service';
import { PostMatchEntity } from '~/entities/post-match.entity';
import { PostMatchRepository } from '~/repositories/post-match.repository';
import { PostRepository } from '~/repositories/post.repository';

@Injectable()
export class PostMatchService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly postMatchRepository: PostMatchRepository,
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
  ) {}

  async applyMatch(
    postId: string,
    applicantId: string,
  ): Promise<PostMatchEntity> {
    const post = await this.postRepository.findById(postId);
    if (!post || post.deletedAt) {
      throw new NotFoundException('Bài đăng không tồn tại hoặc đã bị xóa.');
    }

    if (post.status !== 'open') {
      throw new BadRequestException(
        'Bài đăng này đã đóng hoặc đã có đội ghép.',
      );
    }

    if (post.userId === applicantId) {
      throw new BadRequestException(
        'Bạn không thể tự xin bắt đối vào bài đăng của chính mình.',
      );
    }

    const existingMatch = await this.postMatchRepository.findByPostAndApplicant(
      postId,
      applicantId,
    );
    if (existingMatch) {
      if (existingMatch.status === 'pending') {
        throw new BadRequestException(
          'Bạn đã gửi yêu cầu bắt đối cho bài viết này rồi, vui lòng chờ duyệt.',
        );
      }
      if (existingMatch.status === 'accepted') {
        throw new BadRequestException(
          'Yêu cầu bắt đối của bạn đã được chấp nhận trước đó.',
        );
      }
      // If rejected or cancelled, re-open as pending
      existingMatch.status = 'pending';
      return this.postMatchRepository.save(existingMatch);
    }

    const match = this.postMatchRepository.create({
      id: randomUUID(),
      postId,
      applicantId,
      status: 'pending',
      conversationId: null,
    });

    return this.postMatchRepository.save(match);
  }

  async getPostMatches(postId: string): Promise<PostMatchEntity[]> {
    const post = await this.postRepository.findById(postId);
    if (!post || post.deletedAt) {
      throw new NotFoundException('Không tìm thấy bài đăng.');
    }

    return this.postMatchRepository.findByPostId(postId);
  }

  async acceptMatch(
    postId: string,
    matchId: string,
    userId: string,
  ): Promise<PostMatchEntity> {
    const post = await this.postRepository.findById(postId);
    if (!post || post.deletedAt) {
      throw new NotFoundException('Không tìm thấy bài đăng.');
    }

    if (post.userId !== userId) {
      throw new ForbiddenException(
        'Chỉ chủ bài đăng mới có quyền chấp nhận đội bắt đối.',
      );
    }

    const match = await this.postMatchRepository.findById(matchId);
    if (!match || match.postId !== postId) {
      throw new NotFoundException('Không tìm thấy yêu cầu bắt đối này.');
    }

    match.status = 'accepted';

    // Tự động tạo hội thoại chat giữa chủ bài và người xin ghép
    const { conversation, message } =
      await this.chatService.createMatchConversation(
        post.id,
        post.userId,
        match.applicantId,
        post.title,
      );

    match.conversationId = conversation.id;
    await this.postMatchRepository.save(match);

    post.status = 'matched';
    await this.postRepository.save(post);

    // Phát sự kiện realtime qua Socket
    this.chatGateway.emitToConversation(
      conversation.id,
      'receive_message',
      message,
    );
    this.chatGateway.emitToUsers(
      [post.userId, match.applicantId],
      'match:accepted',
      {
        matchId: match.id,
        postId: post.id,
        conversationId: conversation.id,
        postTitle: post.title,
      },
    );

    return match;
  }

  async rejectMatch(
    postId: string,
    matchId: string,
    userId: string,
  ): Promise<PostMatchEntity> {
    const post = await this.postRepository.findById(postId);
    if (!post || post.deletedAt) {
      throw new NotFoundException('Không tìm thấy bài đăng.');
    }

    if (post.userId !== userId) {
      throw new ForbiddenException(
        'Chỉ chủ bài đăng mới có quyền từ chối yêu cầu.',
      );
    }

    const match = await this.postMatchRepository.findById(matchId);
    if (!match || match.postId !== postId) {
      throw new NotFoundException('Không tìm thấy yêu cầu bắt đối này.');
    }

    match.status = 'rejected';
    return this.postMatchRepository.save(match);
  }

  async cancelMatch(postId: string, applicantId: string): Promise<void> {
    const match = await this.postMatchRepository.findByPostAndApplicant(
      postId,
      applicantId,
    );
    if (!match) {
      throw new NotFoundException('Không tìm thấy yêu cầu bắt đối của bạn.');
    }

    match.status = 'cancelled';
    await this.postMatchRepository.save(match);
  }
}
