import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AvailableSlotsResponseDto } from '../dto/available-slots-response.dto';
import { FieldAvailabilityResponseDto } from '../dto/field-availability-response.dto';

export function ApiFieldAvailabilityControllerDoc() {
  return applyDecorators(ApiTags('Field Availability Public'));
}

export function ApiCheckAvailabilityDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Kiểm tra khả dụng và số lượng sân con còn trống theo loại sân',
      description:
        'Kiểm tra theo thời gian thực dựa trên giờ mở cửa, slot bị khóa và các booking đã xác nhận.',
    }),
    ApiResponse({ status: HttpStatus.OK, type: FieldAvailabilityResponseDto }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description:
        'Giờ bắt đầu phải trước giờ kết thúc hoặc dữ liệu không hợp lệ',
    }),
  );
}

export function ApiGetAvailableSlotsDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lấy các khung giờ đặt sân theo cấu hình giá, ngày và loại sân',
      description:
        'Mỗi cấu hình giá hợp lệ là một khung giờ. Khung hết sân vẫn được trả về với isAvailable=false.',
    }),
    ApiResponse({ status: HttpStatus.OK, type: AvailableSlotsResponseDto }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Ngày hoặc loại sân không hợp lệ',
    }),
  );
}
