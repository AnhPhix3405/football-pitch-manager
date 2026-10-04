import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  OwnerRegistrationResponseDto,
  OwnerRegistrationStatusResponseDto,
} from '../dto/owner-registration-response.dto';

export function ApiOwnerRegistrationControllerDoc() {
  return applyDecorators(
    ApiTags('Owner Registration'),
    ApiBearerAuth(),
  );
}

export function ApiRegisterOwnerDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Gửi hồ sơ đăng ký trở thành chủ sân',
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Gửi yêu cầu đăng ký thành công, chờ Admin phê duyệt',
      type: OwnerRegistrationResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description:
        'Tài khoản đã là chủ sân hoặc đang có một yêu cầu khác chờ phê duyệt',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Yêu cầu đăng nhập hoặc token không hợp lệ',
    }),
  );
}

export function ApiGetOwnerRegistrationStatusDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Tra cứu trạng thái hồ sơ và yêu cầu đăng ký chủ sân gần nhất',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Lấy thông tin trạng thái thành công',
      type: OwnerRegistrationStatusResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Yêu cầu đăng nhập hoặc token không hợp lệ',
    }),
  );
}
