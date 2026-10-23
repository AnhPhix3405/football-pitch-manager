import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class ConfirmBookingDto {
  @IsUUID()
  @IsNotEmpty()
  fieldCourtId!: string;

  @IsOptional()
  @IsString()
  note?: string;
}
