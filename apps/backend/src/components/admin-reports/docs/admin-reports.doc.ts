import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  AdminAuditItemDto,
  AdminAuditListResponseDto,
  AdminModerationReportsResponseDto,
  AdminSystemStatusResponseDto,
  ModerationReportItemDto,
} from '../dto/admin-reports-response.dto';

export function ApiAdminReportsControllerDoc() {
  return applyDecorators(ApiTags('Admin Reports & Audit'), ApiBearerAuth());
}

export function ApiGetAuditLogsDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lấy danh sách nhật ký kiểm toán hệ thống (Audit Logs)',
    }),
    ApiResponse({
      status: 200,
      description: 'Lấy nhật ký kiểm toán thành công',
      type: AdminAuditListResponseDto,
    }),
  );
}

export function ApiGetAuditLogDetailDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lấy thông tin chi tiết một sự kiện kiểm toán theo ID',
    }),
    ApiParam({
      name: 'id',
      description: 'Mã định danh sự kiện kiểm toán',
      example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    }),
    ApiResponse({
      status: 200,
      description: 'Lấy chi tiết sự kiện kiểm toán thành công',
      type: AdminAuditItemDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Không tìm thấy sự kiện kiểm toán',
    }),
  );
}

export function ApiExportAuditLogsDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Xuất dữ liệu nhật ký kiểm toán ra tệp tin CSV hoặc JSON',
    }),
    ApiResponse({
      status: 200,
      description: 'Tải file kiểm toán thành công',
    }),
  );
}

export function ApiGetModerationReportsDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lấy báo cáo tổng hợp và danh sách vi phạm nội dung',
    }),
    ApiResponse({
      status: 200,
      description: 'Lấy báo cáo kiểm duyệt thành công',
      type: AdminModerationReportsResponseDto,
    }),
  );
}

export function ApiGetModerationReportDetailDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lấy thông tin chi tiết một báo cáo vi phạm kiểm duyệt theo ID',
    }),
    ApiParam({
      name: 'id',
      description:
        'Mã định danh báo cáo kiểm duyệt (ví dụ: FR-..., UR-..., POST-..., USR-...)',
      example: 'FR-9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    }),
    ApiResponse({
      status: 200,
      description: 'Lấy chi tiết báo cáo vi phạm thành công',
      type: ModerationReportItemDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Không tìm thấy báo cáo kiểm duyệt',
    }),
  );
}

export function ApiGetSystemStatusDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lấy tình trạng sức khỏe và hiệu năng các nút hạ tầng',
    }),
    ApiResponse({
      status: 200,
      description: 'Lấy thông số hạ tầng thành công',
      type: AdminSystemStatusResponseDto,
    }),
  );
}
