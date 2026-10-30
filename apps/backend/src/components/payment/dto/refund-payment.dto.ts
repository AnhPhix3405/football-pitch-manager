import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class RefundPaymentDto {
  @ApiPropertyOptional({
    description:
      'Số tiền cần hoàn (nếu không truyền sẽ hoàn toàn bộ tiền đã thanh toán)',
    example: 100000,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;

  @ApiPropertyOptional({
    description: 'Lý do hoàn tiền cho đơn đặt sân',
    example: 'Chủ sân hủy do thời tiết mưa bão sân ngập nước',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
