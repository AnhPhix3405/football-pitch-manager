import { BookingEntity } from '~/entities/booking.entity';
import { BookingStatusHistoryResponseDto } from './booking-status-history-response.dto';

export class BookingServiceResponseItemDto {
  serviceId!: string;
  serviceName?: string;
  quantity!: number;
  priceSnapshot!: number;
  subtotal!: number;
}

export class BookingResponseDto {
  id!: string;
  fieldId!: string;
  fieldName?: string;
  requestedCourtType!: string;
  fieldCourtId!: string | null;
  courtName?: string | null;
  bookingDate!: string;
  startTime!: string;
  endTime!: string;
  status!: string;
  totalPrice!: number;
  depositAmount!: number;
  paymentStatus!: string;
  paymentMethod!: string | null;
  ownerNote!: string | null;
  cancelledBy!: string | null;
  cancelReason!: string | null;
  version!: number;
  services!: BookingServiceResponseItemDto[];
  statusHistories?: BookingStatusHistoryResponseDto[];
  createdAt!: string;
  updatedAt!: string;

  static fromEntity(entity: BookingEntity): BookingResponseDto {
    const dto = new BookingResponseDto();
    dto.id = entity.id;
    dto.fieldId = entity.fieldId;
    dto.fieldName = entity.field?.name;
    dto.requestedCourtType = entity.requestedCourtType;
    dto.fieldCourtId = entity.fieldCourtId;
    dto.courtName = entity.fieldCourt?.name ?? null;
    dto.bookingDate =
      typeof entity.bookingDate === 'string'
        ? entity.bookingDate
        : String(entity.bookingDate);
    dto.startTime = entity.startTime?.slice(0, 5);
    dto.endTime = entity.endTime?.slice(0, 5);
    dto.status = entity.status;
    dto.totalPrice = Number(entity.totalPrice);
    dto.depositAmount = entity.depositAmount ? Number(entity.depositAmount) : 0;
    dto.paymentStatus = entity.paymentStatus;
    dto.paymentMethod = entity.paymentMethod;
    dto.ownerNote = entity.ownerNote;
    dto.cancelledBy = entity.cancelledBy;
    dto.cancelReason = entity.cancelReason;
    dto.version = entity.version ?? 1;

    dto.services = (entity.services ?? []).map((bs) => ({
      serviceId: bs.serviceId,
      serviceName: bs.service?.name,
      quantity: bs.quantity,
      priceSnapshot: Number(bs.priceSnapshot),
      subtotal: Number(bs.priceSnapshot) * bs.quantity,
    }));

    if (entity.statusHistories) {
      dto.statusHistories = entity.statusHistories.map((h) =>
        BookingStatusHistoryResponseDto.fromEntity(h),
      );
    }

    dto.createdAt =
      entity.createdAt instanceof Date
        ? entity.createdAt.toISOString()
        : String(entity.createdAt);
    dto.updatedAt =
      entity.updatedAt instanceof Date
        ? entity.updatedAt.toISOString()
        : String(entity.updatedAt);

    return dto;
  }
}
