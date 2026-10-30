import { ApiProperty } from '@nestjs/swagger';

export class RefundResponseDto {
  @ApiProperty({ example: '8f0a0d92-23c2-466d-92a0-4592a407e3d1' })
  refundTransactionId!: string;

  @ApiProperty({ example: '8f0a0d92-23c2-466d-92a0-4592a407e3d1' })
  bookingId!: string;

  @ApiProperty({ example: '100000.00' })
  refundAmount!: string;

  @ApiProperty({ example: 'refunded' })
  paymentStatus!: string;

  @ApiProperty({ example: 'success' })
  transactionStatus!: string;

  @ApiProperty({ example: 'Chủ sân hủy do thời tiết', nullable: true })
  reason!: string | null;

  @ApiProperty()
  createdAt!: Date;
}
