import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserProfileResponseDto } from '../dto/user-profile-response.dto';

export function ApiUserProfileControllerDoc() {
  return applyDecorators(ApiTags('User Profiles'));
}

export function ApiGetMyProfileDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Lấy thông tin chi tiết hồ sơ của tài khoản đang đăng nhập',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Lấy thông tin hồ sơ thành công',
      type: UserProfileResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Yêu cầu đăng nhập hoặc token không hợp lệ',
    }),
  );
}

export function ApiUpdateMyProfileDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Cập nhật thông tin hồ sơ cá nhân của tài khoản hiện tại',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Cập nhật thông tin hồ sơ thành công',
      type: UserProfileResponseDto,
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
