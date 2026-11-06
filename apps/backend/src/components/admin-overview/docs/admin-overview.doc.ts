import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminOverviewResponseDto } from '../dto/admin-overview-response.dto';

export function ApiAdminOverviewControllerDoc() {
  return applyDecorators(ApiTags('Admin Overview'), ApiBearerAuth());
}

export function ApiGetAdminOverviewDoc() {
  return applyDecorators(
    ApiOperation({
      summary:
        'Lấy số liệu tổng quan vận hành hệ thống dành cho Admin (KPI, biểu đồ hoạt động, sức khỏe hệ thống, hàng đợi ưu tiên, nhật ký audit)',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Lấy thông tin tổng quan hệ thống thành công',
      type: AdminOverviewResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Chỉ quản trị viên mới có quyền truy cập',
    }),
  );
}
