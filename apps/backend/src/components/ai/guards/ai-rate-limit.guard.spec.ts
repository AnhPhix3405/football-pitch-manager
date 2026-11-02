jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AiRateLimitGuard } from './ai-rate-limit.guard';
import { AiUsageService } from '../services/ai-usage.service';

describe('AiRateLimitGuard', () => {
  let guard: AiRateLimitGuard;
  let mockAiUsageService: {
    getUserQuotaStatus: jest.Mock;
  };

  beforeEach(async () => {
    mockAiUsageService = {
      getUserQuotaStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiRateLimitGuard,
        {
          provide: AiUsageService,
          useValue: mockAiUsageService,
        },
      ],
    }).compile();

    guard = module.get<AiRateLimitGuard>(AiRateLimitGuard);
  });

  const createMockContext = (userId?: string): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          user: userId ? { id: userId } : undefined,
        }),
      }),
    }) as unknown as ExecutionContext;

  it('should allow if user is not present', async () => {
    const context = createMockContext();
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should throw 429 HttpException if remainingRequests is 0', async () => {
    mockAiUsageService.getUserQuotaStatus.mockResolvedValue({
      remainingRequests: 0,
    });

    const context = createMockContext('user-1');

    await expect(guard.canActivate(context)).rejects.toThrow(HttpException);
    await expect(guard.canActivate(context)).rejects.toMatchObject({
      status: HttpStatus.TOO_MANY_REQUESTS,
      message: 'aiRateLimitExceeded',
    });
  });

  it('should allow if remainingRequests > 0', async () => {
    mockAiUsageService.getUserQuotaStatus.mockResolvedValue({
      remainingRequests: 5,
    });

    const context = createMockContext('user-1');
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
  });
});
