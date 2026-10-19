import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FieldListResponseDto } from '../dto/field-list-response.dto';
import { FieldResponseDto } from '../dto/field-response.dto';

export function ApiPublicFieldControllerDoc() {
  return applyDecorators(ApiTags('Public Fields'));
}

export function ApiGetPublicFieldsDoc() {
  return applyDecorators(
    ApiOperation({
      summary:
        'Lấy danh sách các cụm sân bóng đang hoạt động (active) kèm tìm kiếm (tên, địa chỉ), lọc quận/huyện, lọc đặt cọc, sắp xếp và phân trang',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Lấy danh sách sân công khai thành công',
      type: FieldListResponseDto,
    }),
  );
}

export function ApiGetPublicFieldDetailDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Xem chi tiết cụm sân bóng đang hoạt động theo ID',
    }),
    ApiParam({
      name: 'id',
      description: 'UUID chuẩn của cụm sân',
      example: 'd3b07384-d113-40e1-95b6-75399589d6e4',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Lấy thông tin chi tiết cụm sân thành công',
      type: FieldResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Mã định dạng cụm sân (UUID) không hợp lệ',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description:
        'Không tìm thấy cụm sân hoặc sân chưa được kích hoạt hoạt động',
    }),
  );
}
