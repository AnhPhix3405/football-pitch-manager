import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaymentTransactionResponseDto } from '../dto/payment-transaction-response.dto';
import { VnpayUrlResponseDto } from '../dto/vnpay-url-response.dto';

export const ApiUserPayment = {
  apply: () => applyDecorators(ApiTags('User Payments'), ApiBearerAuth()),
  selectPaymentMethod: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Người dùng chọn phương thức thanh toán booking',
      }),
      ApiParam({ name: 'bookingId', description: 'ID đơn đặt sân' }),
      ApiResponse({
        status: 200,
        description: 'Khởi tạo thông tin giao dịch thành công',
        type: PaymentTransactionResponseDto,
      }),
    ),
  createVnpayUrl: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Tạo link thanh toán VNPay Sandbox cho booking',
      }),
      ApiResponse({
        status: 200,
        description: 'Link thanh toán VNPay kèm checksum',
        type: VnpayUrlResponseDto,
      }),
    ),
};

export const ApiOwnerPayment = {
  apply: () => applyDecorators(ApiTags('Owner Payments'), ApiBearerAuth()),
  confirmCashPayment: () =>
    applyDecorators(
      ApiOperation({ summary: 'Chủ sân xác nhận thu tiền mặt đơn đặt sân' }),
      ApiParam({ name: 'bookingId', description: 'ID đơn đặt sân' }),
      ApiResponse({
        status: 200,
        description: 'Xác nhận thanh toán tiền mặt thành công',
        type: PaymentTransactionResponseDto,
      }),
    ),
};
