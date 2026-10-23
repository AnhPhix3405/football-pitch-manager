import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BlockedSlotResponseDto {
  @ApiProperty({
    description: 'UUID khoảng khóa',
    example: 'b1d2e3f4-a5b6-7890-1234-56789abcdef0',
  })
  id!: string;

  @ApiProperty({
    description: 'UUID sân con bị khóa',
    example: 'c1d2e3f4-a5b6-7890-1234-56789abcdef0',
  })
  fieldCourtId!: string;

  @ApiProperty({
    description: 'Ngày khóa sân',
    example: '2026-10-25',
  })
  blockedDate!: string;

  @ApiProperty({
    description: 'Giờ bắt đầu khóa',
    example: '08:00:00',
  })
  startTime!: string;

  @ApiProperty({
    description: 'Giờ kết thúc khóa',
    example: '10:00:00',
  })
  endTime!: string;

  @ApiPropertyOptional({
    description: 'Lý do khóa sân',
    example: 'Bảo trì thay mặt cỏ nhân tạo',
    nullable: true,
  })
  reason!: string | null;

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
