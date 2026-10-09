import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  OwnerProfileResponseDto,
  PublicOwnerProfileResponseDto,
} from '../dto/owner-profile-response.dto';

export function ApiOwnerProfileControllerDoc() {
  return applyDecorators(ApiTags('Owner Profiles'));
}

export function ApiGetMyProfileDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Lấy thông tin chi tiết hồ sơ chủ sân của tài khoản đang đăng nhập',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Lấy thông tin hồ sơ chủ sân thành công',
      type: OwnerProfileResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Yêu cầu đăng nhập hoặc token không hợp lệ',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Chưa khởi tạo hồ sơ chủ sân',
    }),
  );
}

export function ApiUpdateMyProfileDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Tạo mới hoặc cập nhật thông tin hồ sơ chủ sân của tài khoản hiện tại',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Cập nhật thông tin hồ sơ chủ sân thành công',
      type: OwnerProfileResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Dữ liệu đầu vào không hợp lệ',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Yêu cầu đăng nhập hoặc token không hợp lệ',
    }),
  );
}

export function ApiGetPublicOwnerProfileDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Xem thông tin công khai của chủ sân theo ID hồ sơ',
    }),
    ApiParam({
      name: 'id',
      description: 'UUID của hồ sơ chủ sân',
      example: 'e0a9d1fc-3d23-45f8-b3d2-a7d9f78bc412',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Lấy thông tin công khai thành công',
      type: PublicOwnerProfileResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Không tìm thấy hồ sơ chủ sân',
    }),
  );
}
