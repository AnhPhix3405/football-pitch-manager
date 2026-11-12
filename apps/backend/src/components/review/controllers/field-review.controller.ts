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
import { ApiFieldReviewDocs } from '../docs/field-review.doc';
import { CreateFieldReviewDto } from '../dto/create-field-review.dto';
import { ModerateReviewDto } from '../dto/moderate-review.dto';
import { QueryReviewDto } from '../dto/query-review.dto';
import { ReportReviewDto } from '../dto/report-review.dto';
import { FieldReviewService } from '../services/field-review.service';
import { RatingSummaryService } from '../services/rating-summary.service';
import { ReviewModerationService } from '../services/review-moderation.service';

@ApiFieldReviewDocs.controller()
@Controller('reviews/fields')
export class FieldReviewController {
  constructor(
    private readonly fieldReviewService: FieldReviewService,
    private readonly ratingSummaryService: RatingSummaryService,
    private readonly reviewModerationService: ReviewModerationService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiFieldReviewDocs.create()
  async create(
    @CurrentUser('id') reviewerId: string,
    @Body() dto: CreateFieldReviewDto,
  ) {
    return this.fieldReviewService.createReview(reviewerId, dto);
  }

  @Public()
  @Get(':fieldId')
  @HttpCode(HttpStatus.OK)
  @ApiFieldReviewDocs.getByField()
  async getByField(
    @Param('fieldId') fieldId: string,
    @Query() query: QueryReviewDto,
  ) {
    return this.fieldReviewService.getReviewsByField(fieldId, query);
  }

  @Public()
  @Get(':fieldId/summary')
  @HttpCode(HttpStatus.OK)
  @ApiFieldReviewDocs.getSummary()
  async getSummary(@Param('fieldId') fieldId: string) {
    return this.ratingSummaryService.getFieldSummary(fieldId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/report')
  @HttpCode(HttpStatus.OK)
  @ApiFieldReviewDocs.report()
  async report(@Param('id') id: string, @Body() dto: ReportReviewDto) {
    return this.reviewModerationService.reportFieldReview(id, dto.reason);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/moderate')
  @HttpCode(HttpStatus.OK)
  @ApiFieldReviewDocs.moderate()
  async moderate(
    @Param('id') id: string,
    @Body() dto: ModerateReviewDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.reviewModerationService.moderateFieldReview(
      id,
      dto.action,
      dto.reason,
      adminId,
    );
  }
}
