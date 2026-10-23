import { IsNotEmpty, IsString } from 'class-validator';

export class RejectBookingDto {
  @IsNotEmpty()
  @IsString()
  reason!: string;
}
