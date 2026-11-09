import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BookingEntity } from '~/entities/booking.entity';
import { BookingResponseDto } from '../dto/booking-response.dto';

interface DashboardTotals {
  monthlyRevenue: number;
  todayBookings: number;
  activeFields: number;
  totalFields: number;
  bookedMinutes: number;
  availableMinutes: number;
}

@Injectable()
export class OwnerDashboardService {
  constructor(private readonly dataSource: DataSource) {}

  async getStats(ownerId: string) {
    const [rows, bookings] = await Promise.all([
      this.dataSource.query<DashboardTotals[]>(
        `
        WITH local_clock AS (
          SELECT now() AT TIME ZONE 'Asia/Ho_Chi_Minh' AS local_now
        ),
        period AS (
          SELECT local_now::date AS today,
                 date_trunc('month', local_now) AT TIME ZONE 'Asia/Ho_Chi_Minh' AS month_start,
                 local_now AT TIME ZONE 'Asia/Ho_Chi_Minh' AS as_of
          FROM local_clock
        ),
        owned_fields AS (
          SELECT id, status FROM fields WHERE owner_id = $1
        ),
        open_courts AS (
          SELECT court.id,
                 int4multirange(int4range(
                   extract(epoch FROM hours.open_time)::int,
                   extract(epoch FROM hours.close_time)::int
                 )) AS opening
          FROM field_courts court
          JOIN owned_fields field ON field.id = court.field_id AND field.status = 'active'
          JOIN field_opening_hours hours ON hours.field_id = field.id
          CROSS JOIN period
          WHERE court.status = 'active' AND NOT hours.is_closed
            AND hours.day_of_week = extract(isodow FROM period.today)
            AND hours.open_time IS NOT NULL AND hours.close_time IS NOT NULL
        ),
        court_capacity AS (
          SELECT court.id, court.opening - coalesce((
            SELECT range_agg(int4range(
              extract(epoch FROM slot.start_time)::int,
              extract(epoch FROM slot.end_time)::int
            ))
            FROM field_blocked_slots slot
            WHERE slot.field_court_id = court.id AND slot.blocked_date = period.today
          ), '{}'::int4multirange) AS available
          FROM open_courts court CROSS JOIN period
        ),
        court_usage AS (
          SELECT capacity.available, capacity.available * coalesce((
            SELECT range_agg(int4range(
              extract(epoch FROM booking.start_time)::int,
              extract(epoch FROM booking.end_time)::int
            ))
            FROM bookings booking
            WHERE booking.field_court_id = capacity.id
              AND booking.booking_date = period.today
              AND booking.status IN ('confirmed', 'completed')
          ), '{}'::int4multirange) AS booked
          FROM court_capacity capacity CROSS JOIN period
        )
        SELECT
          coalesce((
            SELECT sum(CASE WHEN tx.type = 'refund' THEN -tx.amount ELSE tx.amount END)
            FROM transactions tx
            JOIN bookings booking ON booking.id = tx.ref_id
            JOIN owned_fields field ON field.id = booking.field_id
            WHERE tx.type IN ('booking_deposit', 'booking_full', 'booking_balance', 'refund') AND tx.status = 'success'
              AND tx.updated_at >= period.month_start AND tx.updated_at <= period.as_of
          ), 0)::float8 AS "monthlyRevenue",
          (
            SELECT count(*) FROM bookings booking
            JOIN owned_fields field ON field.id = booking.field_id
            WHERE booking.booking_date = period.today
              AND booking.status NOT IN ('cancelled', 'rejected')
          )::int AS "todayBookings",
          (SELECT count(*) FROM owned_fields WHERE status = 'active')::int AS "activeFields",
          (SELECT count(*) FROM owned_fields)::int AS "totalFields",
          coalesce((
            SELECT sum(upper(slot) - lower(slot))
            FROM court_usage CROSS JOIN LATERAL unnest(booked) AS slots(slot)
          ), 0)::float8 / 60 AS "bookedMinutes",
          coalesce((
            SELECT sum(upper(slot) - lower(slot))
            FROM court_usage CROSS JOIN LATERAL unnest(available) AS slots(slot)
          ), 0)::float8 / 60 AS "availableMinutes"
        FROM period
        `,
        [ownerId],
      ),
      this.dataSource.getRepository(BookingEntity).find({
        where: { field: { ownerId } },
        relations: { field: true, fieldCourt: true },
        order: { createdAt: 'DESC', id: 'DESC' },
        take: 4,
      }),
    ]);

    const totals = rows[0];
    return {
      ...totals,
      utilizationPercent: totals.availableMinutes
        ? Math.round((totals.bookedMinutes / totals.availableMinutes) * 100)
        : null,
      recentBookings: bookings.map((booking) =>
        BookingResponseDto.fromEntity(booking),
      ),
    };
  }
}
