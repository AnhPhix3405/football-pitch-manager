import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CourtTimelineResponseDto } from '../dto/court-timeline-response.dto';

export function ApiOwnerCourtTimelineControllerDoc() {
  return applyDecorators(ApiTags('Owner Court Timeline'), ApiBearerAuth());
}

export function ApiGetCourtTimelineDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Xem chi tiết timeline lịch vận hành của các sân con theo ngày',
    }),
    ApiResponse({ status: HttpStatus.OK, type: CourtTimelineResponseDto }),
  );
}

export function ApiValidateCourtAssignmentDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Xác thực nhanh một sân con có thể gán cho booking cụ thể không',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Sân con hợp lệ và hoàn toàn trống',
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Sân con đang bị khóa hoặc đã có booking chiếm chỗ',
    }),
  );
}
