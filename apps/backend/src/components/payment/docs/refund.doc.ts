import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RefundResponseDto } from '../dto/refund-response.dto';

export const ApiRefund = {
  apply: () => applyDecorators(ApiTags('Payment Refunds'), ApiBearerAuth()),
  refundBooking: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Hoàn tiền giao dịch cho đơn booking đã hủy/từ chối',
      }),
      ApiParam({
        name: 'bookingId',
        description: 'ID đơn đặt sân cần hoàn tiền',
      }),
      ApiResponse({
        status: 200,
        description: 'Hoàn tiền thành công',
        type: RefundResponseDto,
      }),
    ),
};
