import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BookingResponseDto } from '../dto/booking-response.dto';

export const ApiOwnerBooking = {
  apply() {
    return applyDecorators(ApiTags('Owner Bookings'), ApiBearerAuth());
  },
  getOwnerBookings() {
    return applyDecorators(
      ApiOperation({
        summary: 'Chủ sân lấy danh sách đơn đặt sân của cụm sân',
      }),
      ApiQuery({ name: 'status', required: false }),
      ApiQuery({ name: 'bookingDate', required: false }),
      ApiQuery({ name: 'courtType', required: false }),
      ApiQuery({ name: 'courtId', required: false }),
      ApiQuery({ name: 'page', required: false, type: Number }),
      ApiQuery({ name: 'limit', required: false, type: Number }),
      ApiResponse({
        status: 200,
        description: 'Danh sách đơn đặt sân của cụm sân',
      }),
    );
  },
  getBookingDetail() {
    return applyDecorators(
      ApiOperation({ summary: 'Chủ sân xem chi tiết một đơn đặt sân' }),
      ApiResponse({ status: 200, type: BookingResponseDto }),
      ApiResponse({ status: 404, description: 'Không tìm thấy đơn đặt sân' }),
    );
  },
  confirmBooking() {
    return applyDecorators(
      ApiOperation({
        summary:
          'Chủ sân xác nhận đơn đặt sân và gán sân con (chống đặt trùng)',
      }),
      ApiResponse({ status: 200, type: BookingResponseDto }),
      ApiResponse({ status: 400, description: 'Loại sân con không khớp' }),
      ApiResponse({
        status: 409,
        description: 'Sân con đã bị trùng lịch đặt hoặc đang bị khóa',
      }),
    );
  },
  rejectBooking() {
    return applyDecorators(
      ApiOperation({ summary: 'Chủ sân từ chối đơn đặt sân kèm lý do' }),
      ApiResponse({ status: 200, type: BookingResponseDto }),
      ApiResponse({
        status: 400,
        description: 'Đơn đặt sân không ở trạng thái pending',
      }),
    );
  },
  cancelBooking() {
    return applyDecorators(
      ApiOperation({ summary: 'Chủ sân hủy đơn đặt sân kèm lý do' }),
      ApiResponse({ status: 200, type: BookingResponseDto }),
    );
  },
  completeBooking() {
    return applyDecorators(
      ApiOperation({ summary: 'Chủ sân hoàn tất đơn đặt sân sau trận đấu' }),
      ApiResponse({ status: 200, type: BookingResponseDto }),
      ApiResponse({
        status: 400,
        description: 'Chỉ đơn confirmed mới có thể hoàn tất',
      }),
    );
  },
};
