import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class OpeningHourItemDto {
  @ApiProperty({
    description: 'Thứ trong tuần (1: Thứ Hai, 7: Chủ Nhật)',
    example: 1,
    minimum: 1,
    maximum: 7,
  })
  @IsInt()
  @Min(1, { message: 'Ngày trong tuần phải từ 1 đến 7' })
  @Max(7, { message: 'Ngày trong tuần phải từ 1 đến 7' })
  dayOfWeek!: number;

  @ApiPropertyOptional({
    description: 'Giờ mở cửa (HH:mm hoặc HH:mm:ss)',
    example: '06:00',
    nullable: true,
  })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
    message: 'Giờ mở cửa không đúng định dạng HH:mm',
  })
  openTime?: string;

  @ApiPropertyOptional({
    description: 'Giờ đóng cửa (HH:mm hoặc HH:mm:ss)',
    example: '22:00',
    nullable: true,
  })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
    message: 'Giờ đóng cửa không đúng định dạng HH:mm',
  })
  closeTime?: string;

  @ApiProperty({
    description: 'Trạng thái đóng cửa cả ngày',
    example: false,
  })
  @IsBoolean()
  isClosed!: boolean;
}

export class UpsertFieldOpeningHoursDto {
  @ApiProperty({
    description: 'Danh sách cấu hình giờ mở cửa theo tuần',
    type: [OpeningHourItemDto],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Cần cung cấp ít nhất 1 ngày cấu hình' })
  @ArrayMaxSize(7, { message: 'Tối đa 7 ngày trong tuần' })
  @ValidateNested({ each: true })
  @Type(() => OpeningHourItemDto)
  hours!: OpeningHourItemDto[];
}
