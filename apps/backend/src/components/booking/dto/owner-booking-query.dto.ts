import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class OwnerBookingQueryDto {
  @IsOptional()
  @IsIn(['pending', 'confirmed', 'rejected', 'cancelled', 'completed'])
  status?: string;

  @IsOptional()
  @IsDateString()
  bookingDate?: string;

  @IsOptional()
  @IsIn(['5', '7', '11'])
  courtType?: string;

  @IsOptional()
  @IsUUID()
  courtId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
