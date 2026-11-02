import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PostMatchRepository } from '~/repositories/post-match.repository';
import { PostRepository } from '~/repositories/post.repository';
import { UserRatingSummaryRepository } from '~/repositories/user-rating-summary.repository';
import { AI_ACTION, AI_PROVIDER } from '../constants/ai.constant';
import { AiMatchSuggestionResult } from '../interfaces/ai.interface';
import { AiUsageService } from './ai-usage.service';

@Injectable()
export class AiFoundationService {
  constructor(
    private readonly configService: ConfigService,
    private readonly postRepository: PostRepository,
    private readonly postMatchRepository: PostMatchRepository,
    private readonly userRatingSummaryRepository: UserRatingSummaryRepository,
    private readonly aiUsageService: AiUsageService,
  ) {}

  private getProviderName(): string {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    return apiKey ? AI_PROVIDER.GEMINI : AI_PROVIDER.MOCK;
  }

  async getMatchmakingSuggestion(
    userId: string,
    postId: string,
  ): Promise<AiMatchSuggestionResult> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException('postNotFound');
    }

    const matches = await this.postMatchRepository.findByPostId(postId);
    const pendingApplicants = matches.filter((m) => m.status === 'pending');

    const provider = this.getProviderName();

    if (pendingApplicants.length === 0) {
      return {
        postId,
        recommendedUserId: null,
        compatibilityScore: 0,
        reason: 'Không có ứng viên nào đang chờ duyệt cho bài viết này',
        tokensUsed: 0,
        provider,
      };
    }

    let bestCandidateId: string = pendingApplicants[0].applicantId;
    let bestScore = 0;
    let bestReason = '';

    for (const applicant of pendingApplicants) {
      const summary = await this.userRatingSummaryRepository.findByUserId(
        applicant.applicantId,
      );

      const sportsmanship = summary
        ? parseFloat(summary.sportsmanshipScore)
        : 3.5;
      const totalReviews = summary ? summary.totalReviews : 0;

      const base = 60;
      const sportsmanshipBoost = Math.min(25, (sportsmanship / 5) * 25);
      const experienceBoost = Math.min(14, totalReviews * 2);
      const score = Math.min(
        99,
        Math.round(base + sportsmanshipBoost + experienceBoost),
      );

      if (score > bestScore) {
        bestScore = score;
        bestCandidateId = applicant.applicantId;
        bestReason = `Người chơi có điểm tinh thần thể thao ${sportsmanship.toFixed(1)}/5.0 và đã hoàn thành ${totalReviews} đánh giá trận đấu, phù hợp tiêu chí bài đăng.`;
      }
    }

    const tokensUsed = 120;
    await this.aiUsageService.logUsage(
      userId,
      AI_ACTION.MATCHMAKING_SUGGESTION,
      tokensUsed,
    );

    return {
      postId,
      recommendedUserId: bestCandidateId,
      compatibilityScore: bestScore,
      reason: bestReason,
      tokensUsed,
      provider,
    };
  }
}
