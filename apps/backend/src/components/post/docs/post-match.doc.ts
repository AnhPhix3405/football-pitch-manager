import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PostMatchResponseDto } from '../dto/post-match-response.dto';

export const ApiPostMatchDocs = {
  controller: () =>
    applyDecorators(ApiTags('Post Matches (Matchmaking)'), ApiBearerAuth()),

  applyMatch: () =>
    applyDecorators(
      ApiOperation({ summary: 'Gửi yêu cầu bắt đối cho bài đăng' }),
      ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Đã gửi yêu cầu bắt đối thành công',
        type: PostMatchResponseDto,
      }),
      ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Không thể ứng tuyển bài của chính mình hoặc bài đã đóng',
      }),
    ),

  getPostMatches: () =>
    applyDecorators(
      ApiOperation({ summary: 'Xem danh sách các đội/ứng viên xin bắt đối' }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'Danh sách các đơn ứng tuyển',
        type: [PostMatchResponseDto],
      }),
    ),

  acceptMatch: () =>
    applyDecorators(
      ApiOperation({ summary: 'Chấp nhận đội bắt đối (Khóa concurrency)' }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'Đã duyệt bắt đối thành công và tạo phòng chat',
        type: PostMatchResponseDto,
      }),
      ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Bài đăng đã đủ số người hoặc đơn không hợp lệ',
      }),
    ),

  rejectMatch: () =>
    applyDecorators(
      ApiOperation({ summary: 'Từ chối đội bắt đối' }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'Đã từ chối đơn bắt đối',
        type: PostMatchResponseDto,
      }),
    ),

  cancelMatch: () =>
    applyDecorators(
      ApiOperation({ summary: 'Người dùng rút lại yêu cầu bắt đối' }),
      ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'Đã hủy yêu cầu bắt đối thành công',
      }),
    ),
};
