import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FieldServiceResponseDto } from '../dto/field-service-response.dto';

export function ApiOwnerFieldServiceControllerDoc() {
  return applyDecorators(ApiTags('Owner Field Services'), ApiBearerAuth());
}

export function ApiCreateFieldServiceDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Chủ sân tạo dịch vụ đi kèm mới cho cụm sân' }),
    ApiResponse({ status: HttpStatus.CREATED, type: FieldServiceResponseDto }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Dữ liệu không hợp lệ',
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Tên dịch vụ đã tồn tại trong cụm sân',
    }),
  );
}

export function ApiGetFieldServicesDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Lấy danh sách các dịch vụ của cụm sân' }),
    ApiResponse({ status: HttpStatus.OK, type: [FieldServiceResponseDto] }),
  );
}

export function ApiUpdateFieldServiceDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Cập nhật thông tin dịch vụ' }),
    ApiResponse({ status: HttpStatus.OK, type: FieldServiceResponseDto }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Dịch vụ không tồn tại',
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Tên dịch vụ mới bị trùng',
    }),
  );
}

export function ApiDeleteFieldServiceDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Vô hiệu hóa (tắt hoạt động) dịch vụ' }),
    ApiResponse({ status: HttpStatus.OK, type: FieldServiceResponseDto }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Dịch vụ không tồn tại',
    }),
  );
}
