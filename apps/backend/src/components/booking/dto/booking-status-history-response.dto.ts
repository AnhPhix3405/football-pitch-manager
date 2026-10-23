import { BookingStatusHistoryEntity } from '~/entities/booking-status-history.entity';

export class BookingStatusHistoryResponseDto {
  id!: string;
  bookingId!: string;
  fromStatus!: string | null;
  toStatus!: string;
  changedBy!: string | null;
  changedByName?: string | null;
  reason!: string | null;
  createdAt!: string;

  static fromEntity(
    entity: BookingStatusHistoryEntity,
  ): BookingStatusHistoryResponseDto {
    const dto = new BookingStatusHistoryResponseDto();
    dto.id = entity.id;
    dto.bookingId = entity.bookingId;
    dto.fromStatus = entity.fromStatus;
    dto.toStatus = entity.toStatus;
    dto.changedBy = entity.changedBy;
    dto.changedByName = entity.changedByUser?.email ?? null;
    dto.reason = entity.reason;
    dto.createdAt =
      entity.createdAt instanceof Date
        ? entity.createdAt.toISOString()
        : String(entity.createdAt);
    return dto;
  }
}
