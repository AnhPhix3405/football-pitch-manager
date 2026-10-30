import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { PaymentMethod } from '../constants/payment.constant';

export class SelectPaymentMethodDto {
  @ApiProperty({
    description: 'Phương thức thanh toán (cash hoặc vnpay)',
    enum: PaymentMethod,
    example: PaymentMethod.CASH,
  })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;
}
