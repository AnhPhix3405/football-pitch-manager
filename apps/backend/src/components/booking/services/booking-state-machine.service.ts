import { randomUUID } from 'node:crypto';
import { HttpStatus, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { BookingStatusHistoryEntity } from '~/entities/booking-status-history.entity';
import { BookingEntity } from '~/entities/booking.entity';
import { BookingStatusHistoryRepository } from '~/repositories/booking-status-history.repository';
import { BookingStatusHistoryResponseDto } from '../dto/booking-status-history-response.dto';

export type BookingStatus =
  'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';

const ALLOWED_TRANSITIONS: Record<
  BookingStatus,
  Array<{ next: BookingStatus; roles: string[] }>
> = {
  pending: [
    { next: 'confirmed', roles: ['owner', 'admin'] },
    { next: 'rejected', roles: ['owner', 'admin'] },
    { next: 'cancelled', roles: ['user', 'owner', 'admin'] },
  ],
  confirmed: [
    { next: 'cancelled', roles: ['user', 'owner', 'admin'] },
    { next: 'completed', roles: ['owner', 'admin'] },
  ],
  rejected: [],
  cancelled: [],
  completed: [],
};

@Injectable()
export class BookingStateMachineService {
  constructor(
    private readonly statusHistoryRepository: BookingStatusHistoryRepository,
  ) {}

  validateTransition(
    currentStatus: string,
    nextStatus: string,
    actorRole: string,
  ): void {
    const transitions = ALLOWED_TRANSITIONS[currentStatus as BookingStatus];
    if (!transitions) {
      throw new ApplicationException({
        code: 'INVALID_BOOKING_STATUS_TRANSITION',
        messageKey: 'error.invalidBookingStatusTransition',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const matched = transitions.find((t) => t.next === nextStatus);
    if (!matched) {
      throw new ApplicationException({
        code: 'INVALID_BOOKING_STATUS_TRANSITION',
        messageKey: 'error.invalidBookingStatusTransition',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    if (!matched.roles.includes(actorRole)) {
      throw new ApplicationException({
        code: 'FORBIDDEN_ROLE',
        messageKey: 'error.forbiddenRole',
        status: HttpStatus.FORBIDDEN,
      });
    }
  }

  async transitionStatus(
    em: EntityManager,
    booking: BookingEntity,
    nextStatus: BookingStatus,
    changedByUserId: string,
    actorRole: string,
    reason?: string | null,
  ): Promise<BookingEntity> {
    this.validateTransition(booking.status, nextStatus, actorRole);

    const history = em.create(BookingStatusHistoryEntity, {
      id: randomUUID(),
      bookingId: booking.id,
      fromStatus: booking.status,
      toStatus: nextStatus,
      changedBy: changedByUserId,
      reason: reason ?? null,
    });
    await em.save(BookingStatusHistoryEntity, history);

    booking.status = nextStatus;
    // Detach statusHistories and services before saving booking to prevent TypeORM from cascading old relation array
    delete (booking as unknown as { statusHistories?: unknown })
      .statusHistories;
    delete (booking as unknown as { services?: unknown }).services;
    return em.save(BookingEntity, booking);
  }

  async recordInitialStatus(
    em: EntityManager,
    bookingId: string,
    changedByUserId: string,
  ): Promise<BookingStatusHistoryEntity> {
    const history = em.create(BookingStatusHistoryEntity, {
      id: randomUUID(),
      bookingId,
      fromStatus: null,
      toStatus: 'pending',
      changedBy: changedByUserId,
      reason: 'Đơn đặt sân mới được tạo',
    });
    return em.save(BookingStatusHistoryEntity, history);
  }

  async getStatusHistories(
    bookingId: string,
  ): Promise<BookingStatusHistoryResponseDto[]> {
    const list = await this.statusHistoryRepository.findByBookingId(bookingId);
    return list.map((h) => BookingStatusHistoryResponseDto.fromEntity(h));
  }
}
