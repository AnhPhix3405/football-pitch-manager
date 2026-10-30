import { ApiProperty } from '@nestjs/swagger';

export class VnpayUrlResponseDto {
  @ApiProperty({
    description: 'URL thanh toán chuyển hướng sang VNPay Sandbox',
    example: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...',
  })
  paymentUrl!: string;

  @ApiProperty({
    description: 'Mã tham chiếu giao dịch (vnp_TxnRef)',
    example: '8f0a0d92-23c2-466d-92a0-4592a407e3d1',
  })
  txnRef!: string;
}
