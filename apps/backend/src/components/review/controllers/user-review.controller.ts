import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../../components/auth/decorators/current-user.decorator';
import { Public } from '../../../components/auth/decorators/public.decorator';
import { Roles } from '../../../components/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../components/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../components/auth/guards/roles.guard';
import { ApiUserReviewDocs } from '../docs/user-review.doc';
import { CreateUserReviewDto } from '../dto/create-user-review.dto';
import { ModerateReviewDto } from '../dto/moderate-review.dto';
import { QueryReviewDto } from '../dto/query-review.dto';
import { ReportReviewDto } from '../dto/report-review.dto';
import { RatingSummaryService } from '../services/rating-summary.service';
import { ReviewModerationService } from '../services/review-moderation.service';
import { UserReviewService } from '../services/user-review.service';

@ApiUserReviewDocs.controller()
@Controller('reviews/users')
export class UserReviewController {
  constructor(
    private readonly userReviewService: UserReviewService,
    private readonly ratingSummaryService: RatingSummaryService,
    private readonly reviewModerationService: ReviewModerationService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiUserReviewDocs.create()
  async create(
    @CurrentUser('id') reviewerId: string,
    @Body() dto: CreateUserReviewDto,
  ) {
    return this.userReviewService.createReview(reviewerId, dto);
  }

  @Public()
  @Get(':userId')
  @HttpCode(HttpStatus.OK)
  @ApiUserReviewDocs.getByUser()
  async getByUser(
    @Param('userId') userId: string,
    @Query() query: QueryReviewDto,
  ) {
    return this.userReviewService.getReviewsByUser(userId, query);
  }

  @Public()
  @Get(':userId/summary')
  @HttpCode(HttpStatus.OK)
  @ApiUserReviewDocs.getSummary()
  async getSummary(@Param('userId') userId: string) {
    return this.ratingSummaryService.getUserSummary(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/report')
  @HttpCode(HttpStatus.OK)
  @ApiUserReviewDocs.report()
  async report(@Param('id') id: string, @Body() dto: ReportReviewDto) {
    return this.reviewModerationService.reportUserReview(id, dto.reason);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/moderate')
  @HttpCode(HttpStatus.OK)
  @ApiUserReviewDocs.moderate()
  async moderate(@Param('id') id: string, @Body() dto: ModerateReviewDto) {
    return this.reviewModerationService.moderateUserReview(
      id,
      dto.action,
      dto.reason,
    );
  }
}
