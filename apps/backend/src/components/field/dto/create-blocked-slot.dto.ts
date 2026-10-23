import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateBlockedSlotDto {
  @ApiProperty({
    description: 'Ngày khóa sân (định dạng YYYY-MM-DD)',
    example: '2026-10-25',
  })
  @IsNotEmpty({ message: 'Ngày khóa sân không được để trống' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Ngày khóa sân phải có định dạng YYYY-MM-DD',
  })
  blockedDate!: string;

  @ApiProperty({
    description: 'Giờ bắt đầu khóa (HH:mm)',
    example: '08:00',
  })
  @IsNotEmpty({ message: 'Giờ bắt đầu không được để trống' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
    message: 'Giờ bắt đầu không đúng định dạng HH:mm',
  })
  startTime!: string;

  @ApiProperty({
    description: 'Giờ kết thúc khóa (HH:mm)',
    example: '10:00',
  })
  @IsNotEmpty({ message: 'Giờ kết thúc không được để trống' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
    message: 'Giờ kết thúc không đúng định dạng HH:mm',
  })
  endTime!: string;

  @ApiPropertyOptional({
    description: 'Lý do khóa sân',
    example: 'Bảo trì thay mặt cỏ nhân tạo',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}
