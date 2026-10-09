import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthResponseDto } from '../dto/health-response.dto';

export function ApiHealthControllerDoc() {
  return applyDecorators(ApiTags('Health'));
}

export function ApiHealthCheckDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Kiểm tra trạng thái sẵn sàng và phiên bản hệ thống backend',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Hệ thống đang hoạt động bình thường',
      type: HealthResponseDto,
    }),
  );
}
