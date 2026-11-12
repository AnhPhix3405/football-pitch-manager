import { ApiProperty } from '@nestjs/swagger';

export class AvailableSlotDto {
  @ApiProperty({ example: '17:00' })
  startTime!: string;

  @ApiProperty({ example: '18:00' })
  endTime!: string;

  @ApiProperty({ example: 2 })
  availableCourts!: number;

  @ApiProperty({ example: true })
  isAvailable!: boolean;

  @ApiProperty({
    example: 500000,
    description: 'Fixed price for this entire slot',
  })
  price!: number;
}

export class AvailableSlotsResponseDto {
  @ApiProperty({ example: '2026-10-25' })
  date!: string;

  @ApiProperty({ example: '7' })
  courtType!: string;

  @ApiProperty({ example: false })
  isClosed!: boolean;

  @ApiProperty({ example: '06:00', nullable: true })
  openTime!: string | null;

  @ApiProperty({ example: '22:00', nullable: true })
  closeTime!: string | null;

  @ApiProperty({ type: [AvailableSlotDto] })
  slots!: AvailableSlotDto[];
}
