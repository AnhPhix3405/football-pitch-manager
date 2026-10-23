import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BlockedSlotResponseDto } from '../dto/blocked-slot-response.dto';

export function ApiOwnerBlockedSlotControllerDoc() {
  return applyDecorators(ApiTags('Owner Blocked Slots'), ApiBearerAuth());
}

export function ApiCreateBlockedSlotDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Khóa khung giờ cho sân con (bảo trì/sự kiện)' }),
    ApiResponse({ status: HttpStatus.CREATED, type: BlockedSlotResponseDto }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Dữ liệu không hợp lệ hoặc startTime >= endTime',
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Khung giờ bị trùng với khung giờ đã khóa trước đó',
    }),
  );
}

export function ApiGetBlockedSlotsDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Xem danh sách khung giờ bị khóa của sân con' }),
    ApiResponse({ status: HttpStatus.OK, type: [BlockedSlotResponseDto] }),
  );
}

export function ApiDeleteBlockedSlotDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Mở khóa khung giờ sân con' }),
    ApiResponse({ status: HttpStatus.OK, type: BlockedSlotResponseDto }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Khung giờ khóa không tồn tại',
    }),
  );
}
