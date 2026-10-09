import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminOwnerApprovalDetailResponseDto } from '../dto/admin-owner-approval-detail-response.dto';
import { AdminOwnerApprovalListResponseDto } from '../dto/admin-owner-approval-list-response.dto';

export function ApiAdminOwnerApprovalControllerDoc() {
  return applyDecorators(
    ApiTags('Admin Owner Approvals'),
    ApiBearerAuth(),
  );
}

export function ApiGetApprovalsDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Danh sách các yêu cầu đăng ký chủ sân kèm bộ lọc và phân trang',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Lấy danh sách yêu cầu đăng ký chủ sân thành công',
      type: AdminOwnerApprovalListResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Chỉ quản trị viên mới có quyền truy cập',
    }),
  );
}

export function ApiGetApprovalDetailDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Chi tiết yêu cầu đăng ký chủ sân và hồ sơ liên quan',
    }),
    ApiParam({
      name: 'id',
      description: 'ID yêu cầu phê duyệt',
      example: 'd3b07384-d113-40e1-95b6-75399589d6e4',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Lấy chi tiết yêu cầu phê duyệt thành công',
      type: AdminOwnerApprovalDetailResponseDto,
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

export function ApiApproveOwnerRegistrationDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Phê duyệt hồ sơ đăng ký chủ sân và nâng quyền tài khoản thành Owner',
    }),
    ApiParam({
      name: 'id',
      description: 'ID yêu cầu phê duyệt',
      example: 'd3b07384-d113-40e1-95b6-75399589d6e4',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Phê duyệt thành công',
      type: AdminOwnerApprovalDetailResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Yêu cầu không ở trạng thái pending hoặc đã được xử lý trước đó',
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

export function ApiRejectOwnerRegistrationDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Từ chối hồ sơ đăng ký chủ sân kèm lý do',
    }),
    ApiParam({
      name: 'id',
      description: 'ID yêu cầu phê duyệt',
      example: 'd3b07384-d113-40e1-95b6-75399589d6e4',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Từ chối thành công',
      type: AdminOwnerApprovalDetailResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Yêu cầu không ở trạng thái pending hoặc đã được xử lý trước đó',
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
