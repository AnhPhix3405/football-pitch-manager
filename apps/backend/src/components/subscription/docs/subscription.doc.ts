import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SubscriptionPlanResponseDto } from '../dto/subscription-plan-response.dto';
import { SubscriptionResponseDto } from '../dto/subscription-response.dto';

export const ApiSubscriptionPlanDocs = {
  controller: () => applyDecorators(ApiTags('Subscription Plans')),

  createPlan: () =>
    applyDecorators(
      ApiBearerAuth(),
      ApiOperation({
        summary: 'Admin tạo gói hội viên / subscription plan mới',
      }),
      ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Tạo gói thành công',
        type: SubscriptionPlanResponseDto,
      }),
      ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Chỉ quản trị viên mới có quyền tạo gói',
      }),
    ),

  getActivePlans: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Lấy danh sách các gói thành viên đang mở đăng ký',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'Danh sách các gói thành viên khả dụng',
        type: [SubscriptionPlanResponseDto],
      }),
    ),

  getPlanDetail: () =>
    applyDecorators(
      ApiOperation({ summary: 'Xem thông tin chi tiết một gói thành viên' }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'Chi tiết gói thành viên',
        type: SubscriptionPlanResponseDto,
      }),
      ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Không tìm thấy gói thành viên',
      }),
    ),

  deactivatePlan: () =>
    applyDecorators(
      ApiBearerAuth(),
      ApiOperation({ summary: 'Admin vô hiệu hóa gói thành viên' }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'Vô hiệu hóa gói thành công',
        type: SubscriptionPlanResponseDto,
      }),
    ),
};

export const ApiSubscriptionDocs = {
  controller: () => applyDecorators(ApiTags('Subscriptions')),

  subscribe: () =>
    applyDecorators(
      ApiBearerAuth(),
      ApiOperation({ summary: 'Người dùng / chủ sân đăng ký gói thành viên' }),
      ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Đăng ký gói thành công',
        type: SubscriptionResponseDto,
      }),
      ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Đang có gói thành viên hoạt động hoặc gói không hợp lệ',
      }),
    ),

  getMyActive: () =>
    applyDecorators(
      ApiBearerAuth(),
      ApiOperation({
        summary: 'Lấy thông tin gói thành viên hiện tại của bản thân',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'Thông tin gói thành viên đang hoạt động',
        type: SubscriptionResponseDto,
      }),
    ),

  cancel: () =>
    applyDecorators(
      ApiBearerAuth(),
      ApiOperation({ summary: 'Hủy gói thành viên đang hoạt động' }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'Hủy gói thành viên thành công',
        type: SubscriptionResponseDto,
      }),
      ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Không tìm thấy thông tin gói đăng ký',
      }),
    ),
};
