import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FieldCourtResponseDto } from '../dto/field-court-response.dto';

export function ApiOwnerFieldCourtControllerDoc() {
  return applyDecorators(ApiTags('Owner Field Courts'), ApiBearerAuth());
}

export function ApiCreateFieldCourtDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Chủ sân tạo sân con mới thuộc cụm sân' }),
    ApiResponse({ status: HttpStatus.CREATED, type: FieldCourtResponseDto }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Dữ liệu không hợp lệ',
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Tên sân con đã tồn tại trong cụm sân',
    }),
  );
}

export function ApiGetFieldCourtsDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Lấy danh sách các sân con thuộc cụm sân' }),
    ApiResponse({ status: HttpStatus.OK, type: [FieldCourtResponseDto] }),
  );
}

export function ApiGetFieldCourtDetailDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Xem chi tiết một sân con' }),
    ApiResponse({ status: HttpStatus.OK, type: FieldCourtResponseDto }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Sân con không tồn tại',
    }),
  );
}

export function ApiUpdateFieldCourtDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Cập nhật thông tin sân con' }),
    ApiResponse({ status: HttpStatus.OK, type: FieldCourtResponseDto }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Sân con không tồn tại',
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Tên sân con mới bị trùng lặp',
    }),
  );
}

export function ApiDeleteFieldCourtDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Vô hiệu hóa (inactive) sân con' }),
    ApiResponse({ status: HttpStatus.OK, type: FieldCourtResponseDto }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Sân con không tồn tại',
    }),
  );
}
