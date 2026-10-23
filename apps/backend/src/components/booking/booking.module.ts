import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingServiceEntity } from '~/entities/booking-service.entity';
import { BookingStatusHistoryEntity } from '~/entities/booking-status-history.entity';
import { BookingEntity } from '~/entities/booking.entity';
import { BookingServiceRepository } from '~/repositories/booking-service.repository';
import { BookingStatusHistoryRepository } from '~/repositories/booking-status-history.repository';
import { BookingRepository } from '~/repositories/booking.repository';
import { AuthModule } from '../auth/auth.module';
import { FieldModule } from '../field/field.module';
import { OwnerBookingController } from './controllers/owner-booking.controller';
import { UserBookingController } from './controllers/user-booking.controller';
import { BookingStateMachineService } from './services/booking-state-machine.service';
import { OwnerBookingService } from './services/owner-booking.service';
import { UserBookingService } from './services/user-booking.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BookingEntity,
      BookingServiceEntity,
      BookingStatusHistoryEntity,
    ]),
    AuthModule,
    FieldModule,
  ],
  controllers: [UserBookingController, OwnerBookingController],
  providers: [
    BookingRepository,
    BookingServiceRepository,
    BookingStatusHistoryRepository,
    BookingStateMachineService,
    UserBookingService,
    OwnerBookingService,
  ],
  exports: [
    BookingRepository,
    BookingServiceRepository,
    BookingStatusHistoryRepository,
    BookingStateMachineService,
    UserBookingService,
    OwnerBookingService,
  ],
})
export class BookingModule {}
