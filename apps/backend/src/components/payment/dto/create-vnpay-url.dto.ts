import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateVnpayUrlDto {
  @ApiProperty({
    description: 'Mã ID đơn đặt sân',
    example: '8f0a0d92-23c2-466d-92a0-4592a407e3d1',
  })
  @IsNotEmpty()
  @IsUUID()
  bookingId!: string;

  @ApiPropertyOptional({ enum: ['deposit', 'full'] })
  @IsOptional()
  @IsIn(['deposit', 'full'])
  option?: 'deposit' | 'full';

  @ApiPropertyOptional({
    description: 'Mô tả nội dung thanh toán',
    example: 'Thanh toan tien coc dat san bong',
  })
  @IsOptional()
  @IsString()
  orderInfo?: string;
}
