import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostMatchRepository } from '~/repositories/post-match.repository';
import { PostRepository } from '~/repositories/post.repository';
import { UserRatingSummaryRepository } from '~/repositories/user-rating-summary.repository';
import { UserReviewRepository } from '~/repositories/user-review.repository';
import { UserRepository } from '~/repositories/user.repository';
import { CreateUserReviewDto } from '../dto/create-user-review.dto';

@Injectable()
export class UserReviewService {
  constructor(
    private readonly userReviewRepository: UserReviewRepository,
    private readonly userRatingSummaryRepository: UserRatingSummaryRepository,
    private readonly postRepository: PostRepository,
    private readonly postMatchRepository: PostMatchRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async createReview(
    reviewerId: string,
    targetUserId: string,
    dto: CreateUserReviewDto,
  ) {
    if (reviewerId === targetUserId) {
      throw new BadRequestException('Bạn không thể tự đánh giá chính mình');
    }

    const targetUser = await this.userRepository.findById(targetUserId);
    if (!targetUser) {
      throw new NotFoundException('Người chơi được đánh giá không tồn tại');
    }

    const post = await this.postRepository.findById(dto.postId);
    if (!post) {
      throw new NotFoundException('Bài đăng tìm đối không tồn tại');
    }

    // Kiểm tra xem reviewer và targetUser có cùng tham gia trận đấu này không
    const matches = await this.postMatchRepository.findByPostId(dto.postId);
    const acceptedMatches = matches.filter((m) => m.status === 'accepted');

    const isAuthor = post.userId === reviewerId;
    const isTargetAuthor = post.userId === targetUserId;

    const reviewerAccepted =
      isAuthor || acceptedMatches.some((m) => m.applicantId === reviewerId);
    const targetAccepted =
      isTargetAuthor ||
      acceptedMatches.some((m) => m.applicantId === targetUserId);

    if (!reviewerAccepted || !targetAccepted) {
      throw new BadRequestException(
        'Chỉ các người chơi đã ghép đội thành công trong trận đấu mới có thể đánh giá nhau',
      );
    }

    const existing =
      await this.userReviewRepository.findByPostTargetAndReviewer(
        dto.postId,
        targetUserId,
        reviewerId,
      );
    if (existing) {
      throw new ConflictException(
        'Bạn đã gửi đánh giá cho người chơi này trong trận đấu rồi',
      );
    }

    const newReview = this.userReviewRepository.create({
      id: randomUUID(),
      targetUserId,
      reviewerId,
      postId: dto.postId,
      rating: dto.rating,
      comment: dto.comment?.trim() || null,
      isFlagged: false,
    });

    const savedReview = await this.userReviewRepository.save(newReview);

    // Tính toán lại summary và điểm thể thao fair-play
    await this.updateUserRatingSummary(targetUserId);

    return savedReview;
  }

  async getReviews(targetUserId: string, page = 1, limit = 10) {
    const { items, total } =
      await this.userReviewRepository.findPageByTargetUserId(
        targetUserId,
        page,
        limit,
      );

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getRatingSummary(targetUserId: string) {
    const summary =
      await this.userRatingSummaryRepository.findByUserId(targetUserId);
    if (!summary) {
      return {
        userId: targetUserId,
        avgRating: '0.00',
        totalReviews: 0,
        sportsmanshipScore: '0.00',
      };
    }
    return summary;
  }

  private async updateUserRatingSummary(userId: string): Promise<void> {
    const stats =
      await this.userReviewRepository.getRatingStatsByTargetUserId(userId);
    const v = stats.count;
    const R = stats.avgRating;

    // Điểm tinh thần thể thao (Sportsmanship Score): Thang điểm 100
    // Điểm cơ bản = R * 20 (ví dụ 5 sao = 100 điểm, 4.5 sao = 90 điểm)
    const sportsmanshipScore = v > 0 ? R * 20 : 0;

    await this.userRatingSummaryRepository.upsertSummary(
      userId,
      R,
      v,
      sportsmanshipScore,
    );
  }
}
