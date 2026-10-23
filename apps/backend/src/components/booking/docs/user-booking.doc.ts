import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BookingResponseDto } from '../dto/booking-response.dto';

export const ApiUserBooking = {
  apply() {
    return applyDecorators(ApiTags('User Bookings'), ApiBearerAuth());
  },
  createBooking() {
    return applyDecorators(
      ApiOperation({ summary: 'Tạo yêu cầu đặt sân mới kèm dịch vụ đi kèm' }),
      ApiResponse({
        status: 201,
        description: 'Đã tạo yêu cầu đặt sân thành công',
        type: BookingResponseDto,
      }),
      ApiResponse({
        status: 400,
        description: 'Dữ liệu không hợp lệ hoặc ngoài giờ mở cửa',
      }),
      ApiResponse({
        status: 409,
        description: 'Không còn sân con khả dụng trong khung giờ',
      }),
    );
  },
  getMyBookings() {
    return applyDecorators(
      ApiOperation({
        summary: 'Lấy danh sách đơn đặt sân của người dùng hiện tại',
      }),
      ApiQuery({ name: 'status', required: false }),
      ApiQuery({ name: 'bookingDate', required: false }),
      ApiQuery({ name: 'page', required: false, type: Number }),
      ApiQuery({ name: 'limit', required: false, type: Number }),
      ApiResponse({ status: 200, description: 'Danh sách đơn đặt sân' }),
    );
  },
  getBookingDetail() {
    return applyDecorators(
      ApiOperation({ summary: 'Xem chi tiết đơn đặt sân của người dùng' }),
      ApiResponse({ status: 200, type: BookingResponseDto }),
      ApiResponse({ status: 404, description: 'Không tìm thấy đơn đặt sân' }),
    );
  },
  cancelMyBooking() {
    return applyDecorators(
      ApiOperation({ summary: 'Người dùng hủy đơn đặt sân của chính mình' }),
      ApiResponse({ status: 200, type: BookingResponseDto }),
      ApiResponse({
        status: 400,
        description: 'Đơn đặt sân không ở trạng thái cho phép hủy',
      }),
    );
  },
};
