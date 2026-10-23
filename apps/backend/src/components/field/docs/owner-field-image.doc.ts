import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FieldImageResponseDto } from '../dto/field-image-response.dto';

export function ApiOwnerFieldImageControllerDoc() {
  return applyDecorators(ApiTags('Owner Field Images'), ApiBearerAuth());
}

export function ApiCreateFieldImageDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Thêm hình ảnh cho cụm sân' }),
    ApiResponse({ status: HttpStatus.CREATED, type: FieldImageResponseDto }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'URL không hợp lệ',
    }),
  );
}

export function ApiGetFieldImagesDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Lấy danh sách hình ảnh của cụm sân' }),
    ApiResponse({ status: HttpStatus.OK, type: [FieldImageResponseDto] }),
  );
}

export function ApiUpdateFieldImageDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Cập nhật thứ tự hoặc đặt ảnh đại diện (thumbnail)',
    }),
    ApiResponse({ status: HttpStatus.OK, type: FieldImageResponseDto }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Hình ảnh không tồn tại',
    }),
  );
}

export function ApiDeleteFieldImageDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Xóa hình ảnh khỏi cụm sân' }),
    ApiResponse({ status: HttpStatus.OK, type: FieldImageResponseDto }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Hình ảnh không tồn tại',
    }),
  );
}
