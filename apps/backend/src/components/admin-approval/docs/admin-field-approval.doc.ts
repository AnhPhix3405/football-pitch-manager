import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminFieldApprovalDetailResponseDto } from '../dto/admin-field-approval-detail-response.dto';
import { AdminFieldApprovalListResponseDto } from '../dto/admin-field-approval-list-response.dto';

export function ApiAdminFieldApprovalControllerDoc() {
  return applyDecorators(ApiTags('Admin Field Approvals'), ApiBearerAuth());
}

export function ApiGetFieldApprovalsDoc() {
  return applyDecorators(
    ApiOperation({
      summary:
        'Danh sách các yêu cầu tạo và cập nhật sân kèm bộ lọc và phân trang',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Lấy danh sách yêu cầu duyệt sân thành công',
      type: AdminFieldApprovalListResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Chỉ quản trị viên mới có quyền truy cập',
    }),
  );
}

export function ApiGetFieldApprovalDetailDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Chi tiết yêu cầu duyệt sân và thông tin cụm sân liên quan',
    }),
    ApiParam({
      name: 'id',
      description: 'ID yêu cầu phê duyệt',
      example: 'd3b07384-d113-40e1-95b6-75399589d6e4',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Lấy chi tiết yêu cầu phê duyệt sân thành công',
      type: AdminFieldApprovalDetailResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Không tìm thấy yêu cầu phê duyệt',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Chỉ quản trị viên mới có quyền truy cập',
    }),
  );
}

export function ApiApproveFieldDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Phê duyệt yêu cầu tạo mới hoặc cập nhật thông tin sân bóng',
    }),
    ApiParam({
      name: 'id',
      description: 'ID yêu cầu phê duyệt',
      example: 'd3b07384-d113-40e1-95b6-75399589d6e4',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Phê duyệt sân thành công',
      type: AdminFieldApprovalDetailResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description:
        'Yêu cầu không ở trạng thái pending hoặc đã được xử lý trước đó',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Không tìm thấy yêu cầu phê duyệt hoặc cụm sân',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Chỉ quản trị viên mới có quyền truy cập',
    }),
  );
}

export function ApiRejectFieldDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Từ chối yêu cầu tạo mới hoặc cập nhật sân bóng kèm lý do',
    }),
    ApiParam({
      name: 'id',
      description: 'ID yêu cầu phê duyệt',
      example: 'd3b07384-d113-40e1-95b6-75399589d6e4',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Từ chối yêu cầu phê duyệt sân thành công',
      type: AdminFieldApprovalDetailResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description:
        'Yêu cầu không ở trạng thái pending hoặc thiếu lý do từ chối',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Không tìm thấy yêu cầu phê duyệt hoặc cụm sân',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Chỉ quản trị viên mới có quyền truy cập',
    }),
  );
}
