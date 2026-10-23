import { ApiProperty } from '@nestjs/swagger';

export class CourtTypeAvailabilityDto {
  @ApiProperty({ example: '5' })
  courtType!: string;

  @ApiProperty({ example: 4, description: 'Total active courts of this type' })
  totalCourts!: number;

  @ApiProperty({
    example: 3,
    description: 'Available courts free of bookings/blocked slots',
  })
  availableCourts!: number;

  @ApiProperty({ example: true })
  isAvailable!: boolean;

  @ApiProperty({ example: ['court-id-1', 'court-id-2'] })
  availableCourtIds!: string[];
}

export class FieldAvailabilityResponseDto {
  @ApiProperty({ example: 'd038f706-a55b-46af-aff2-feccb9f739ba' })
  fieldId!: string;

  @ApiProperty({ example: '2026-10-25' })
  date!: string;

  @ApiProperty({ example: '08:00' })
  startTime!: string;

  @ApiProperty({ example: '10:00' })
  endTime!: string;

  @ApiProperty({
    example: true,
    description: 'Whether the field is open during requested interval',
  })
  isOpen!: boolean;

  @ApiProperty({ type: [CourtTypeAvailabilityDto] })
  courtTypes!: CourtTypeAvailabilityDto[];
}
