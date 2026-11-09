import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { BookingPaymentOption } from '../constants/payment.constant';

export class OwnerPaymentSettingsDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsEnum(BookingPaymentOption, { each: true })
  options!: BookingPaymentOption[];

  @IsOptional()
  @IsIn(['fixed', 'percentage'])
  depositType?: 'fixed' | 'percentage';

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000000000)
  depositValue?: number;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z0-9]{1,32}$/)
  terminalCode?: string;

  @IsOptional()
  @IsString()
  @MinLength(16)
  @MaxLength(256)
  hashSecret?: string;
}
