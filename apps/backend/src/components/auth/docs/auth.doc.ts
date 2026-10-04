import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GoogleLoginResponseDto } from '../dto/google-login-response.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { LogoutResponseDto } from '../dto/logout-response.dto';
import { RefreshTokenResponseDto } from '../dto/refresh-token-response.dto';
import { RegisterResponseDto } from '../dto/register-response.dto';

export function ApiAuthControllerDoc() {
  return applyDecorators(ApiTags('Auth'));
}

export function ApiRegisterDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Đăng ký tài khoản người dùng mới (User/Customer)',
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Đăng ký tài khoản thành công',
      type: RegisterResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Dữ liệu đầu vào không hợp lệ',
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Email hoặc số điện thoại đã tồn tại trong hệ thống',
    }),
  );
}

export function ApiLoginDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Đăng nhập tài khoản bằng Email và Mật khẩu',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Đăng nhập thành công, trả về Access Token và lưu Refresh Token vào HttpOnly Cookie',
      type: LoginResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Email hoặc mật khẩu không chính xác, hoặc tài khoản chưa kích hoạt/bị khóa',
    }),
  );
}

export function ApiGoogleLoginDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Đăng nhập hoặc đăng ký nhanh bằng Google ID Token',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Đăng nhập Google thành công',
      type: GoogleLoginResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Google ID token không hợp lệ hoặc đã hết hạn',
    }),
  );
}

export function ApiRefreshTokenDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Làm mới Access Token khi hết hạn thông qua Refresh Token cookie / body',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Cấp phát Access Token mới thành công',
      type: RefreshTokenResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Refresh token không hợp lệ, đã hết hạn hoặc phiên làm việc đã bị thu hồi',
    }),
  );
}

export function ApiLogoutDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Đăng xuất tài khoản và vô hiệu hóa phiên làm việc hiện tại',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Đăng xuất thành công và xóa Refresh Token cookie',
      type: LogoutResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Phiên làm việc không hợp lệ',
    }),
  );
}
