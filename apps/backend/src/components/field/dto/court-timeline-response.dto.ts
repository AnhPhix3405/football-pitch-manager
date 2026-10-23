import { ApiProperty } from '@nestjs/swagger';

export class TimelineBlockedSlotDto {
  @ApiProperty({ example: 'slot-1' })
  id!: string;

  @ApiProperty({ example: '08:00' })
  startTime!: string;

  @ApiProperty({ example: '10:00' })
  endTime!: string;

  @ApiProperty({ example: 'Bảo trì định kỳ' })
  reason!: string | null;
}

export class TimelineBookingDto {
  @ApiProperty({ example: 'booking-1' })
  id!: string;

  @ApiProperty({ example: '14:00' })
  startTime!: string;

  @ApiProperty({ example: '16:00' })
  endTime!: string;

  @ApiProperty({ example: 'confirmed' })
  status!: string;
}

export class CourtTimelineItemDto {
  @ApiProperty({ example: 'court-1' })
  courtId!: string;

  @ApiProperty({ example: 'Sân 1' })
  courtName!: string;

  @ApiProperty({ example: '5' })
  courtType!: string;

  @ApiProperty({ example: 'active' })
  status!: string;

  @ApiProperty({ type: [TimelineBlockedSlotDto] })
  blockedSlots!: TimelineBlockedSlotDto[];

  @ApiProperty({ type: [TimelineBookingDto] })
  bookings!: TimelineBookingDto[];
}

export class CourtTimelineResponseDto {
  @ApiProperty({ example: 'field-1' })
  fieldId!: string;

  @ApiProperty({ example: '2026-10-25' })
  date!: string;

  @ApiProperty({ example: '06:00' })
  openTime!: string | null;

  @ApiProperty({ example: '22:00' })
  closeTime!: string | null;

  @ApiProperty({ example: false })
  isClosed!: boolean;

  @ApiProperty({ type: [CourtTimelineItemDto] })
  courts!: CourtTimelineItemDto[];
}
