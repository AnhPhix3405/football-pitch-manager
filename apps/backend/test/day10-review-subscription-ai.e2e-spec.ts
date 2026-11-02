/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { configureApplication } from '../src/common/configure-application';
import { JwtAuthGuard } from '../src/components/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/components/auth/guards/roles.guard';
import { AiController } from '../src/components/ai/controllers/ai.controller';
import { AiRateLimitGuard } from '../src/components/ai/guards/ai-rate-limit.guard';
import { AiFoundationService } from '../src/components/ai/services/ai-foundation.service';
import { AiUsageService } from '../src/components/ai/services/ai-usage.service';
import { FieldRankingController } from '../src/components/review/controllers/field-ranking.controller';
import { FieldReviewController } from '../src/components/review/controllers/field-review.controller';
import { UserReviewController } from '../src/components/review/controllers/user-review.controller';
import { FieldRankingService } from '../src/components/review/services/field-ranking.service';
import { FieldReviewService } from '../src/components/review/services/field-review.service';
import { RatingSummaryService } from '../src/components/review/services/rating-summary.service';
import { ReviewModerationService } from '../src/components/review/services/review-moderation.service';
import { UserReviewService } from '../src/components/review/services/user-review.service';
import { SubscriptionPlanController } from '../src/components/subscription/controllers/subscription-plan.controller';
import { SubscriptionController } from '../src/components/subscription/controllers/subscription.controller';
import { SubscriptionPlanService } from '../src/components/subscription/services/subscription-plan.service';
import { SubscriptionService } from '../src/components/subscription/services/subscription.service';

describe('Day 10 Review, Subscription & AI Assistant API (e2e)', () => {
  let app: NestFastifyApplication;

  const mockFieldReviewService = {
    createReview: jest.fn(),
    getReviewsByField: jest.fn(),
    getReviewById: jest.fn(),
  };

  const mockUserReviewService = {
    createReview: jest.fn(),
    getReviewsByUser: jest.fn(),
    getReviewById: jest.fn(),
  };

  const mockRatingSummaryService = {
    getFieldSummary: jest.fn(),
    getUserSummary: jest.fn(),
    recalculateFieldSummary: jest.fn(),
    recalculateUserSummary: jest.fn(),
  };

  const mockReviewModerationService = {
    reportFieldReview: jest.fn(),
    reportUserReview: jest.fn(),
    moderateFieldReview: jest.fn(),
    moderateUserReview: jest.fn(),
  };

  const mockFieldRankingService = {
    getTopRankedFields: jest.fn(),
  };

  const mockSubscriptionPlanService = {
    createPlan: jest.fn(),
    getActivePlans: jest.fn(),
    getPlanById: jest.fn(),
    deactivatePlan: jest.fn(),
  };

  const mockSubscriptionService = {
    subscribe: jest.fn(),
    getMyActiveSubscription: jest.fn(),
    cancelSubscription: jest.fn(),
  };

  const mockAiFoundationService = {
    getMatchmakingSuggestion: jest.fn(),
  };

  const mockAiUsageService = {
    getUserQuotaStatus: jest.fn(),
    logUsage: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [
        FieldReviewController,
        UserReviewController,
        FieldRankingController,
        SubscriptionPlanController,
        SubscriptionController,
        AiController,
      ],
      providers: [
        { provide: FieldReviewService, useValue: mockFieldReviewService },
        { provide: UserReviewService, useValue: mockUserReviewService },
        { provide: RatingSummaryService, useValue: mockRatingSummaryService },
        {
          provide: ReviewModerationService,
          useValue: mockReviewModerationService,
        },
        { provide: FieldRankingService, useValue: mockFieldRankingService },
        {
          provide: SubscriptionPlanService,
          useValue: mockSubscriptionPlanService,
        },
        { provide: SubscriptionService, useValue: mockSubscriptionService },
        { provide: AiFoundationService, useValue: mockAiFoundationService },
        { provide: AiUsageService, useValue: mockAiUsageService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: any) => {
          const req = context.switchToHttp().getRequest();
          req.user = {
            id: '123e4567-e89b-42d3-a456-426614174099',
            email: 'tester@test.com',
            role: 'admin',
          };
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AiRateLimitGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    configureApplication(app);
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Field Reviews & Bayesian Rating API', () => {
    const fieldId = '123e4567-e89b-42d3-a456-426614174001';
    const bookingId = '123e4567-e89b-42d3-a456-426614174002';

    it('POST /reviews/fields - creates a field review', async () => {
      mockFieldReviewService.createReview.mockResolvedValue({
        id: 'review-1',
        fieldId,
        bookingId,
        rating: 5,
        comment: 'Great pitch condition!',
      });

      const res = await app.inject({
        method: 'POST',
        url: '/reviews/fields',
        payload: {
          bookingId,
          rating: 5,
          comment: 'Great pitch condition!',
        },
      });

      expect(res.statusCode).toBe(201);
      const json = JSON.parse(res.payload);
      expect(json.data.rating).toBe(5);
      expect(json.data.fieldId).toBe(fieldId);
    });

    it('GET /reviews/fields/:fieldId - retrieves reviews list with pagination', async () => {
      mockFieldReviewService.getReviewsByField.mockResolvedValue({
        data: [{ id: 'review-1', rating: 5 }],
        total: 1,
        page: 1,
        limit: 10,
      });

      const res = await app.inject({
        method: 'GET',
        url: `/reviews/fields/${fieldId}?page=1&limit=10`,
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.data.total).toBe(1);
    });

    it('GET /reviews/fields/:fieldId/summary - gets bayesian rating summary', async () => {
      mockRatingSummaryService.getFieldSummary.mockResolvedValue({
        avgRating: '4.85',
        totalReviews: 20,
        bayesianScore: '4.680',
      });

      const res = await app.inject({
        method: 'GET',
        url: `/reviews/fields/${fieldId}/summary`,
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.data.bayesianScore).toBe('4.680');
      expect(json.data.totalReviews).toBe(20);
    });

    it('GET /fields/rankings/top - gets top ranked fields by Bayesian score', async () => {
      mockFieldRankingService.getTopRankedFields.mockResolvedValue([
        {
          fieldId,
          name: 'San Chanh Hung',
          avgRating: '4.85',
          totalReviews: 20,
          bayesianScore: '4.680',
        },
      ]);

      const res = await app.inject({
        method: 'GET',
        url: '/fields/rankings/top?limit=5',
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.data).toHaveLength(1);
      expect(json.data[0].fieldId).toBe(fieldId);
    });
  });

  describe('User Reviews & Sportsmanship API', () => {
    const targetUserId = '123e4567-e89b-42d3-a456-426614174003';
    const postId = '123e4567-e89b-42d3-a456-426614174004';

    it('POST /reviews/users - creates a sportsmanship review for teammate/opponent', async () => {
      mockUserReviewService.createReview.mockResolvedValue({
        id: 'u-review-1',
        targetUserId,
        postId,
        rating: 5,
        comment: 'Fair play player',
      });

      const res = await app.inject({
        method: 'POST',
        url: '/reviews/users',
        payload: {
          targetUserId,
          postId,
          rating: 5,
          comment: 'Fair play player',
        },
      });

      expect(res.statusCode).toBe(201);
      const json = JSON.parse(res.payload);
      expect(json.data.rating).toBe(5);
    });

    it('GET /reviews/users/:userId/summary - gets sportsmanship score', async () => {
      mockRatingSummaryService.getUserSummary.mockResolvedValue({
        avgRating: '5.00',
        totalReviews: 4,
        sportsmanshipScore: '4.25',
      });

      const res = await app.inject({
        method: 'GET',
        url: `/reviews/users/${targetUserId}/summary`,
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.data.sportsmanshipScore).toBe('4.25');
    });
  });

  describe('Review Moderation API', () => {
    it('POST /reviews/fields/:id/report - reports an inappropriate review', async () => {
      mockReviewModerationService.reportFieldReview.mockResolvedValue({
        id: 'review-1',
        isFlagged: true,
        flagReason: 'Spam comment',
      });

      const res = await app.inject({
        method: 'POST',
        url: '/reviews/fields/review-1/report',
        payload: { reason: 'Spam comment' },
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.data.isFlagged).toBe(true);
    });

    it('PATCH /reviews/fields/:id/moderate - admin hides violating review', async () => {
      mockReviewModerationService.moderateFieldReview.mockResolvedValue({
        id: 'review-1',
        isFlagged: true,
        flagReason: 'HIDDEN: Inappropriate language',
      });

      const res = await app.inject({
        method: 'PATCH',
        url: '/reviews/fields/review-1/moderate',
        payload: { action: 'hide', reason: 'Inappropriate language' },
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.data.flagReason).toContain('HIDDEN');
    });
  });

  describe('Subscription Plan & Lifecycle API', () => {
    const planId = '123e4567-e89b-42d3-a456-426614174005';

    it('POST /subscription-plans - creates a new plan', async () => {
      mockSubscriptionPlanService.createPlan.mockResolvedValue({
        id: planId,
        name: 'Gói Vàng VIP',
        price: '299000.00',
        durationDays: 30,
        isActive: true,
      });

      const res = await app.inject({
        method: 'POST',
        url: '/subscription-plans',
        payload: {
          name: 'Gói Vàng VIP',
          price: 299000,
          durationDays: 30,
          benefit: { aiQuotaDaily: 100 },
        },
      });

      expect(res.statusCode).toBe(201);
      const json = JSON.parse(res.payload);
      expect(json.data.name).toBe('Gói Vàng VIP');
    });

    it('GET /subscription-plans - retrieves active plans', async () => {
      mockSubscriptionPlanService.getActivePlans.mockResolvedValue([
        { id: planId, name: 'Gói Vàng VIP' },
      ]);

      const res = await app.inject({
        method: 'GET',
        url: '/subscription-plans',
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.data).toHaveLength(1);
    });

    it('POST /subscriptions - subscribes user to plan', async () => {
      mockSubscriptionService.subscribe.mockResolvedValue({
        id: 'sub-1',
        planId,
        status: 'active',
        startDate: '2026-10-31',
        endDate: '2026-11-30',
      });

      const res = await app.inject({
        method: 'POST',
        url: '/subscriptions',
        payload: { planId },
      });

      expect(res.statusCode).toBe(201);
      const json = JSON.parse(res.payload);
      expect(json.data.status).toBe('active');
    });

    it('GET /subscriptions/me - gets active subscription', async () => {
      mockSubscriptionService.getMyActiveSubscription.mockResolvedValue({
        id: 'sub-1',
        planId,
        status: 'active',
      });

      const res = await app.inject({
        method: 'GET',
        url: '/subscriptions/me',
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.data.id).toBe('sub-1');
    });

    it('DELETE /subscriptions/:id - cancels subscription', async () => {
      mockSubscriptionService.cancelSubscription.mockResolvedValue({
        id: 'sub-1',
        status: 'cancelled',
      });

      const res = await app.inject({
        method: 'DELETE',
        url: '/subscriptions/sub-1',
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.data.status).toBe('cancelled');
    });
  });

  describe('AI Assistant & Quota Tracking API', () => {
    it('GET /ai/usage/me - gets daily quota status', async () => {
      mockAiUsageService.getUserQuotaStatus.mockResolvedValue({
        dailyRequestsUsed: 1,
        dailyQuota: 50,
        remainingRequests: 49,
        totalTokensUsed: 120,
      });

      const res = await app.inject({
        method: 'GET',
        url: '/ai/usage/me',
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.data.dailyQuota).toBe(50);
      expect(json.data.remainingRequests).toBe(49);
    });

    it('POST /ai/matchmaking/suggestions - requests AI candidate recommendation', async () => {
      const postId = '123e4567-e89b-42d3-a456-426614174004';
      mockAiFoundationService.getMatchmakingSuggestion.mockResolvedValue({
        postId,
        recommendedUserId: '123e4567-e89b-42d3-a456-426614174003',
        compatibilityScore: 92,
        reason: 'Điểm fair-play cao và lịch sử hoạt động tốt',
        tokensUsed: 120,
        provider: 'mock',
      });

      const res = await app.inject({
        method: 'POST',
        url: '/ai/matchmaking/suggestions',
        payload: { postId },
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.data.compatibilityScore).toBe(92);
      expect(json.data.provider).toBe('mock');
    });
  });
});
