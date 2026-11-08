import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserReviewEntity } from '~/entities/user-review.entity';
import { PostMatchRepository } from '~/repositories/post-match.repository';
import { PostRepository } from '~/repositories/post.repository';
import { UserProfileRepository } from '~/repositories/user-profile.repository';
import { UserReviewRepository } from '~/repositories/user-review.repository';
import { CreateUserReviewDto } from '../dto/create-user-review.dto';
import { QueryReviewDto } from '../dto/query-review.dto';
import { RatingSummaryService } from './rating-summary.service';

@Injectable()
export class UserReviewService {
  constructor(
    private readonly userReviewRepository: UserReviewRepository,
    private readonly postRepository: PostRepository,
    private readonly postMatchRepository: PostMatchRepository,
    private readonly ratingSummaryService: RatingSummaryService,
    private readonly userProfileRepository: UserProfileRepository,
  ) {}

  async createReview(
    reviewerId: string,
    dto: CreateUserReviewDto,
  ): Promise<UserReviewEntity> {
    if (reviewerId === dto.targetUserId) {
      throw new BadRequestException('selfReviewNotAllowed');
    }

    const post = await this.postRepository.findById(dto.postId);
    if (!post) {
      throw new NotFoundException('postNotFound');
    }

    const matches = await this.postMatchRepository.findByPostId(dto.postId);
    const acceptedMatches = matches.filter(
      (match) => match.status === 'accepted',
    );

    const isReviewerParticipant =
      post.userId === reviewerId ||
      acceptedMatches.some((m) => m.applicantId === reviewerId);

    const isTargetParticipant =
      post.userId === dto.targetUserId ||
      acceptedMatches.some((m) => m.applicantId === dto.targetUserId);

    if (!isReviewerParticipant || !isTargetParticipant) {
      throw new BadRequestException('playersNotInSameMatch');
    }

    if (acceptedMatches.length === 0) {
      throw new BadRequestException('matchNotAcceptedYet');
    }

    // Chỉ cho phép đánh giá khi trận đấu đã quá hạn / kết thúc
    const endTimeStr = post.endTime || post.startTime;
    const matchEndDateTime = new Date(`${post.playDate}T${endTimeStr}`);
    if (isNaN(matchEndDateTime.getTime()) || new Date() < matchEndDateTime) {
      throw new BadRequestException('matchNotFinishedYet');
    }

    const existingReview =
      await this.userReviewRepository.findByPostTargetAndReviewer(
        dto.postId,
        dto.targetUserId,
        reviewerId,
      );
    if (existingReview) {
      throw new ConflictException('duplicateUserReview');
    }

    const review = this.userReviewRepository.create({
      id: randomUUID(),
      postId: dto.postId,
      targetUserId: dto.targetUserId,
      reviewerId,
      rating: dto.rating,
      comment: dto.comment ?? null,
      isFlagged: false,
      flagReason: null,
    });

    const saved = await this.userReviewRepository.save(review);

    await this.ratingSummaryService.recalculateUserSummary(dto.targetUserId);

    return saved;
  }

  async getReviewsByUser(
    userId: string,
    query: QueryReviewDto,
  ): Promise<{
    data: UserReviewEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(query.limit) || 10));

    const { items, total } = await this.userReviewRepository.findByTargetUserId(
      userId,
      {
        page,
        limit,
        rating: query.rating,
      },
    );

    return {
      data: items,
      total,
      page,
      limit,
    };
  }

  async getReviewById(id: string): Promise<UserReviewEntity> {
    const review = await this.userReviewRepository.findById(id);
    if (!review) {
      throw new NotFoundException('reviewNotFound');
    }
    return review;
  }

  async getPostMatchReviewStatus(
    reviewerId: string,
    postId: string,
  ): Promise<{
    isFinished: boolean;
    isMatched: boolean;
    hasReviewedOpponent: boolean;
    opponent: {
      id: string;
      fullName: string | null;
      avatarUrl: string | null;
    } | null;
    canReview: boolean;
  }> {
    const post = await this.postRepository.findPostDetailById(postId);
    if (!post) {
      throw new NotFoundException('postNotFound');
    }

    const matches = await this.postMatchRepository.findByPostId(postId);
    const acceptedMatches = matches.filter(
      (match) => match.status === 'accepted',
    );

    const isAuthor = post.userId === reviewerId;
    const isApplicant = acceptedMatches.some(
      (m) => m.applicantId === reviewerId,
    );

    if (!isAuthor && !isApplicant) {
      return {
        isFinished: false,
        isMatched: false,
        hasReviewedOpponent: false,
        opponent: null,
        canReview: false,
      };
    }

    let opponentId: string | null = null;
    let opponentName: string | null = null;
    let opponentAvatar: string | null = null;

    if (isAuthor) {
      const match = acceptedMatches[0];
      if (match) {
        opponentId = match.applicantId;
        const profile =
          await this.userProfileRepository.findByUserId(opponentId);
        opponentName =
          profile?.fullName ||
          match.applicant?.email?.split('@')[0] ||
          'Đối thủ';
        opponentAvatar = profile?.avatarUrl || null;
      }
    } else {
      opponentId = post.userId;
      const profile = await this.userProfileRepository.findByUserId(opponentId);
      opponentName =
        profile?.fullName || post.user?.email?.split('@')[0] || 'Chủ bài đăng';
      opponentAvatar = profile?.avatarUrl || null;
    }

    const endTimeStr = post.endTime || post.startTime;
    const matchEndDateTime = new Date(`${post.playDate}T${endTimeStr}`);
    const isFinished =
      !isNaN(matchEndDateTime.getTime()) && new Date() >= matchEndDateTime;
    const isMatched = acceptedMatches.length > 0;

    let hasReviewedOpponent = false;
    if (opponentId) {
      const existing =
        await this.userReviewRepository.findByPostTargetAndReviewer(
          postId,
          opponentId,
          reviewerId,
        );
      hasReviewedOpponent = !!existing;
    }

    const canReview =
      isMatched && isFinished && !!opponentId && !hasReviewedOpponent;

    return {
      isFinished,
      isMatched,
      hasReviewedOpponent,
      opponent: opponentId
        ? {
            id: opponentId,
            fullName: opponentName,
            avatarUrl: opponentAvatar,
          }
        : null,
      canReview,
    };
  }
}
