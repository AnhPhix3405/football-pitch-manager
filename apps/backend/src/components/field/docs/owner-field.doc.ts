import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FieldListResponseDto } from '../dto/field-list-response.dto';
import { FieldResponseDto } from '../dto/field-response.dto';

export function ApiOwnerFieldControllerDoc() {
  return applyDecorators(
    ApiTags('Owner Fields'),
    ApiBearerAuth(),
  );
}

export function ApiCreateFieldDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Chủ sân tạo cụm sân bóng mới (trạng thái khởi tạo: pending)',
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Tạo cụm sân mới thành công',
      type: FieldResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Dữ liệu đầu vào hoặc cấu hình đặt cọc không hợp lệ',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Chỉ tài khoản Chủ sân (Owner) hoặc Admin mới có quyền thao tác',
    }),
  );
}

export function ApiGetOwnerFieldsDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Danh sách các cụm sân thuộc quyền sở hữu của chủ sân đang đăng nhập',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Lấy danh sách cụm sân thành công',
      type: FieldListResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Chỉ tài khoản Chủ sân (Owner) hoặc Admin mới có quyền thao tác',
    }),
  );
}

export function ApiGetOwnerFieldDetailDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Chi tiết cụm sân của chủ sân theo ID',
    }),
    ApiParam({
      name: 'id',
      description: 'UUID của cụm sân',
      example: 'd3b07384-d113-40e1-95b6-75399589d6e4',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Lấy chi tiết cụm sân thành công',
      type: FieldResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Không tìm thấy cụm sân hoặc sân không thuộc quyền sở hữu',
    }),
  );
}

export function ApiUpdateFieldDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Cập nhật thông tin cụm sân và cấu hình đặt cọc',
    }),
    ApiParam({
      name: 'id',
      description: 'UUID của cụm sân',
      example: 'd3b07384-d113-40e1-95b6-75399589d6e4',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Cập nhật cụm sân thành công',
      type: FieldResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Dữ liệu cập nhật hoặc cấu hình cọc không hợp lệ',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Không tìm thấy cụm sân hoặc sân không thuộc quyền sở hữu',
    }),
  );
}

export function ApiDeactivateFieldDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Ngưng hoạt động cụm sân (chuyển trạng thái sang inactive)',
    }),
    ApiParam({
      name: 'id',
      description: 'UUID của cụm sân',
      example: 'd3b07384-d113-40e1-95b6-75399589d6e4',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Ngưng hoạt động cụm sân thành công',
      type: FieldResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Không tìm thấy cụm sân hoặc sân không thuộc quyền sở hữu',
    }),
  );
}
