import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FieldPricingResponseDto } from '../dto/field-pricing-response.dto';

export function ApiOwnerFieldPricingControllerDoc() {
  return applyDecorators(ApiTags('Owner Field Pricing'), ApiBearerAuth());
}

export function ApiCreateFieldPricingDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Chủ sân tạo cấu hình bảng giá mới theo loại sân và khung giờ',
    }),
    ApiResponse({ status: HttpStatus.CREATED, type: FieldPricingResponseDto }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Dữ liệu không hợp lệ hoặc giờ bắt đầu >= giờ kết thúc',
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Khung giờ giá bị chồng chéo với khung giờ đã tồn tại',
    }),
  );
}

export function ApiGetFieldPricingDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Lấy danh sách các cấu hình giá của cụm sân' }),
    ApiResponse({ status: HttpStatus.OK, type: [FieldPricingResponseDto] }),
  );
}

export function ApiUpdateFieldPricingDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Cập nhật cấu hình giá' }),
    ApiResponse({ status: HttpStatus.OK, type: FieldPricingResponseDto }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Cấu hình giá không tồn tại',
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Khung giờ cập nhật bị chồng chéo với khung giờ khác',
    }),
  );
}

export function ApiDeleteFieldPricingDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Xóa một cấu hình giá' }),
    ApiResponse({ status: HttpStatus.OK, description: 'Xóa thành công' }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Cấu hình giá không tồn tại',
    }),
  );
}
