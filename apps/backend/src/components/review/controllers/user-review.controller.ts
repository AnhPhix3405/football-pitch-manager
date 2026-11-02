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
import { CreateUserReviewDto } from '../dto/create-user-review.dto';
import { QueryReviewsDto } from '../dto/query-reviews.dto';
import { UserReviewService } from '../services/user-review.service';

@ApiTags('Đánh giá người chơi')
@Controller('users/:id')
export class UserReviewController {
  constructor(private readonly userReviewService: UserReviewService) {}

  @Post('reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Đánh giá tinh thần thể thao của người chơi sau trận đấu',
  })
  async createReview(
    @Param('id', ParseUUIDPipe) targetUserId: string,
    @CurrentUser('id') reviewerId: string,
    @Body() dto: CreateUserReviewDto,
  ) {
    return this.userReviewService.createReview(reviewerId, targetUserId, dto);
  }

  @Get('reviews')
  @ApiOperation({
    summary: 'Xem danh sách đánh giá của một người chơi có phân trang',
  })
  async getReviews(
    @Param('id', ParseUUIDPipe) targetUserId: string,
    @Query() query: QueryReviewsDto,
  ) {
    return this.userReviewService.getReviews(
      targetUserId,
      query.page || 1,
      query.limit || 10,
    );
  }

  @Get('rating-summary')
  @ApiOperation({
    summary: 'Xem tổng hợp điểm tinh thần thể thao và đánh giá của người chơi',
  })
  async getRatingSummary(@Param('id', ParseUUIDPipe) targetUserId: string) {
    return this.userReviewService.getRatingSummary(targetUserId);
  }
}
