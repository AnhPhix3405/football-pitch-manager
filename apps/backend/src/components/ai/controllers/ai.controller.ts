import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '~/components/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '~/components/auth/guards/jwt-auth.guard';
import { ApiAiDocs } from '../docs/ai.doc';
import { AiMatchSuggestionRequestDto } from '../dto/ai-match-suggestion-request.dto';
import { AiRateLimitGuard } from '../guards/ai-rate-limit.guard';
import { AiFoundationService } from '../services/ai-foundation.service';
import { AiUsageService } from '../services/ai-usage.service';

@ApiAiDocs.controller()
@Controller('ai')
export class AiController {
  constructor(
    private readonly aiFoundationService: AiFoundationService,
    private readonly aiUsageService: AiUsageService,
  ) {}

  @UseGuards(JwtAuthGuard, AiRateLimitGuard)
  @Post('matchmaking/suggestions')
  @HttpCode(HttpStatus.OK)
  @ApiAiDocs.matchmakingSuggestion()
  async getMatchmakingSuggestion(
    @CurrentUser('id') userId: string,
    @Body() dto: AiMatchSuggestionRequestDto,
  ) {
    return this.aiFoundationService.getMatchmakingSuggestion(
      userId,
      dto.postId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('usage/me')
  @HttpCode(HttpStatus.OK)
  @ApiAiDocs.getUsage()
  async getMyUsage(@CurrentUser('id') userId: string) {
    return this.aiUsageService.getUserQuotaStatus(userId);
  }
}
