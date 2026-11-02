import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserReviewEntity } from '~/entities/user-review.entity';
import { PostMatchRepository } from '~/repositories/post-match.repository';
import { PostRepository } from '~/repositories/post.repository';
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
}
