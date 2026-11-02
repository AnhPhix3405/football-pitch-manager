import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '~/components/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '~/components/auth/guards/jwt-auth.guard';
import { CreateFieldReviewDto } from '../dto/create-field-review.dto';
import { QueryReviewsDto } from '../dto/query-reviews.dto';
import { FieldReviewService } from '../services/field-review.service';

@ApiTags('Đánh giá sân bóng')
@Controller('fields/:id')
export class FieldReviewController {
  constructor(private readonly fieldReviewService: FieldReviewService) {}

  @Post('reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Gửi đánh giá và chấm sao cho sân sau khi hoàn tất đặt sân',
  })
  async createReview(
    @Param('id', ParseUUIDPipe) fieldId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateFieldReviewDto,
  ) {
    return this.fieldReviewService.createReview(userId, fieldId, dto);
  }

  @Get('reviews')
  @ApiOperation({
    summary: 'Lấy danh sách đánh giá công khai của sân bóng có phân trang',
  })
  async getReviews(
    @Param('id', ParseUUIDPipe) fieldId: string,
    @Query() query: QueryReviewsDto,
  ) {
    return this.fieldReviewService.getReviews(
      fieldId,
      query.page || 1,
      query.limit || 10,
    );
  }

  @Get('rating-summary')
  @ApiOperation({
    summary: 'Lấy tổng hợp điểm rating và điểm bayesian của sân bóng',
  })
  async getRatingSummary(@Param('id', ParseUUIDPipe) fieldId: string) {
    return this.fieldReviewService.getRatingSummary(fieldId);
  }
}
