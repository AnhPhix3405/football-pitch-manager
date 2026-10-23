import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
