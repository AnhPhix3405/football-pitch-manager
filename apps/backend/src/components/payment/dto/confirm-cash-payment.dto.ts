import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ConfirmCashPaymentDto {
  @ApiPropertyOptional({
    description: 'Ghi chú xác nhận thu tiền mặt của chủ sân',
    example: 'Khách đã thanh toán đủ tiền mặt tại quầy',
  })
  @IsOptional()
  @IsString()
  note?: string;
}
