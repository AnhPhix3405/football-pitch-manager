import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FieldOpeningHourResponseDto } from '../dto/field-opening-hour-response.dto';

export function ApiOwnerFieldOpeningHourControllerDoc() {
  return applyDecorators(ApiTags('Owner Field Opening Hours'), ApiBearerAuth());
}

export function ApiUpsertFieldOpeningHoursDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Cấu hình hoặc cập nhật giờ mở cửa theo tuần cho cụm sân',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      type: [FieldOpeningHourResponseDto],
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description:
        'Cấu hình giờ mở cửa không hợp lệ (ví dụ: openTime >= closeTime)',
    }),
  );
}

export function ApiGetFieldOpeningHoursDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Xem danh sách giờ mở cửa theo tuần của cụm sân' }),
    ApiResponse({
      status: HttpStatus.OK,
      type: [FieldOpeningHourResponseDto],
    }),
  );
}
