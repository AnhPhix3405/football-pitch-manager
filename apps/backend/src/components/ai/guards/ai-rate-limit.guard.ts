import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { AiUsageService } from '../services/ai-usage.service';

interface RequestWithUser {
  user?: {
    id: string;
  };
}

@Injectable()
export class AiRateLimitGuard implements CanActivate {
  constructor(private readonly aiUsageService: AiUsageService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const userId = request.user?.id;

    if (!userId) {
      return true;
    }

    const quotaStatus = await this.aiUsageService.getUserQuotaStatus(userId);

    if (quotaStatus.remainingRequests <= 0) {
      throw new HttpException(
        'aiRateLimitExceeded',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
