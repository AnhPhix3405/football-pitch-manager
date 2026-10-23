import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';

export class BookingServiceItemInputDto {
  @IsUUID()
  @IsNotEmpty()
  serviceId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateBookingDto {
  @IsUUID()
  @IsNotEmpty()
  fieldId!: string;

  @IsIn(['5', '7', '11'])
  @IsNotEmpty()
  courtType!: string;

  @IsDateString()
  @IsNotEmpty()
  bookingDate!: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  @IsNotEmpty()
  startTime!: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  @IsNotEmpty()
  endTime!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookingServiceItemInputDto)
  services?: BookingServiceItemInputDto[];
}
