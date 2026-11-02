import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FieldReviewResponseDto } from '../dto/field-review-response.dto';
import { FieldRatingSummaryResponseDto } from '../dto/rating-summary-response.dto';

export const ApiFieldReviewDocs = {
  controller: () => applyDecorators(ApiTags('Field Reviews')),

  create: () =>
    applyDecorators(
      ApiBearerAuth(),
      ApiOperation({ summary: 'Đánh giá sân bóng sau khi hoàn thành đơn đặt' }),
      ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Tạo đánh giá thành công',
        type: FieldReviewResponseDto,
      }),
      ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Đơn đặt sân chưa hoàn thành hoặc thông tin không hợp lệ',
      }),
      ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Đã đánh giá đơn đặt sân này trước đó',
      }),
    ),

  getByField: () =>
    applyDecorators(
      ApiOperation({ summary: 'Lấy danh sách đánh giá của một sân bóng' }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'Danh sách đánh giá phân trang',
      }),
    ),

  getSummary: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Lấy tóm tắt điểm đánh giá Bayesian của sân bóng',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'Điểm đánh giá trung bình và Bayesian score',
        type: FieldRatingSummaryResponseDto,
      }),
    ),

  report: () =>
    applyDecorators(
      ApiBearerAuth(),
      ApiOperation({
        summary: 'Báo cáo đánh giá sân bóng có nội dung vi phạm',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'Gửi báo cáo vi phạm thành công',
      }),
      ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Không tìm thấy đánh giá',
      }),
    ),

  moderate: () =>
    applyDecorators(
      ApiBearerAuth(),
      ApiOperation({
        summary: 'Quản trị viên kiểm duyệt đánh giá (dismiss/hide)',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'Xử lý kiểm duyệt thành công',
      }),
      ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Chỉ quản trị viên mới có quyền thao tác',
      }),
    ),
};
