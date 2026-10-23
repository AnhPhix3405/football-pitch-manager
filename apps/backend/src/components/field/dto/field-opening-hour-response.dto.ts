import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FieldOpeningHourResponseDto {
  @ApiProperty({
    description: 'UUID bản ghi',
    example: 'h1d2e3f4-a5b6-7890-1234-56789abcdef0',
  })
  id!: string;

  @ApiProperty({
    description: 'UUID cụm sân',
    example: 'd3b07384-d113-40e1-95b6-75399589d6e4',
  })
  fieldId!: string;

  @ApiProperty({
    description: 'Thứ trong tuần (1: Thứ Hai, 7: Chủ Nhật)',
    example: 1,
  })
  dayOfWeek!: number;

  @ApiPropertyOptional({
    description: 'Giờ mở cửa',
    example: '06:00:00',
    nullable: true,
  })
  openTime!: string | null;

  @ApiPropertyOptional({
    description: 'Giờ đóng cửa',
    example: '22:00:00',
    nullable: true,
  })
  closeTime!: string | null;

  @ApiProperty({
    description: 'Đóng cửa cả ngày',
    example: false,
  })
  isClosed!: boolean;

  @ApiProperty({
    description: 'Thời điểm tạo',
    example: '2026-10-23T08:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Thời điểm cập nhật',
    example: '2026-10-23T08:00:00.000Z',
  })
  updatedAt!: Date;
}
