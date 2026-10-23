import { ApiProperty } from '@nestjs/swagger';

export class PriceQuoteSegmentDto {
  @ApiProperty({ example: '16:00' })
  startTime!: string;

  @ApiProperty({ example: '17:00' })
  endTime!: string;

  @ApiProperty({ example: 60, description: 'Duration in minutes' })
  durationMinutes!: number;

  @ApiProperty({ example: 200000, description: 'Hourly rate in VND' })
  hourlyRate!: number;

  @ApiProperty({ example: 200000, description: 'Subtotal in VND' })
  subtotal!: number;
}

export class PriceQuoteResponseDto {
  @ApiProperty({ example: 'd038f706-a55b-46af-aff2-feccb9f739ba' })
  fieldId!: string;

  @ApiProperty({ example: '5' })
  courtType!: string;

  @ApiProperty({ example: '2026-10-25' })
  date!: string;

  @ApiProperty({ example: 'weekday' })
  dayType!: string;

  @ApiProperty({ example: '16:00' })
  startTime!: string;

  @ApiProperty({ example: '18:00' })
  endTime!: string;

  @ApiProperty({ example: 120, description: 'Total duration in minutes' })
  totalDurationMinutes!: number;

  @ApiProperty({
    example: 500000,
    description: 'Total calculated price in VND',
  })
  totalPrice!: number;

  @ApiProperty({ type: [PriceQuoteSegmentDto] })
  breakdown!: PriceQuoteSegmentDto[];
}
