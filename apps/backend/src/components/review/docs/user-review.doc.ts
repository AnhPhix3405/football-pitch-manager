import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRatingSummaryResponseDto } from '../dto/rating-summary-response.dto';
import { UserReviewResponseDto } from '../dto/user-review-response.dto';

export const ApiUserReviewDocs = {
  controller: () => applyDecorators(ApiTags('User Reviews')),

  create: () =>
    applyDecorators(
      ApiBearerAuth(),
      ApiOperation({
        summary: 'Đánh giá tinh thần thể thao của người chơi cùng trận đấu',
      }),
      ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Tạo đánh giá thành công',
        type: UserReviewResponseDto,
      }),
      ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description:
          'Không thể tự đánh giá chính mình hoặc 2 người không cùng tham gia trận đấu',
      }),
      ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Đã đánh giá người chơi này trong trận đấu này rồi',
      }),
    ),

  getByUser: () =>
    applyDecorators(
      ApiOperation({ summary: 'Lấy danh sách đánh giá của một người chơi' }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'Danh sách đánh giá người chơi phân trang',
      }),
    ),

  getSummary: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Lấy tóm tắt điểm uy tín / tinh thần thể thao của người chơi',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'Điểm trung bình và sportsmanship score',
        type: UserRatingSummaryResponseDto,
      }),
    ),

  report: () =>
    applyDecorators(
      ApiBearerAuth(),
      ApiOperation({ summary: 'Báo cáo đánh giá người chơi vi phạm' }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'Gửi báo cáo thành công',
      }),
    ),

  moderate: () =>
    applyDecorators(
      ApiBearerAuth(),
      ApiOperation({
        summary: 'Quản trị viên kiểm duyệt đánh giá người chơi (dismiss/hide)',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'Xử lý kiểm duyệt thành công',
      }),
    ),
};
