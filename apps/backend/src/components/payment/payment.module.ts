import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingEntity } from '~/entities/booking.entity';
import { FieldEntity } from '~/entities/field.entity';
import { OwnerProfileEntity } from '~/entities/owner-profile.entity';
import { TransactionEntity } from '~/entities/transaction.entity';
import { UserEntity } from '~/entities/user.entity';
import { BookingRepository } from '~/repositories/booking.repository';
import { OwnerProfileRepository } from '~/repositories/owner-profile.repository';
import { TransactionRepository } from '~/repositories/transaction.repository';
import { AuthModule } from '../auth/auth.module';
import { OwnerPaymentController } from './controllers/owner-payment.controller';
import { RefundController } from './controllers/refund.controller';
import { UserPaymentController } from './controllers/user-payment.controller';
import { VnpayCallbackController } from './controllers/vnpay-callback.controller';
import { PaymentService } from './services/payment.service';
import { RefundService } from './services/refund.service';
import { VnpayIpnService } from './services/vnpay-ipn.service';
import { VnpayService } from './services/vnpay.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TransactionEntity,
      BookingEntity,
      OwnerProfileEntity,
      FieldEntity,
      UserEntity,
    ]),
    AuthModule,
  ],
  controllers: [
    UserPaymentController,
    OwnerPaymentController,
    VnpayCallbackController,
    RefundController,
  ],
  providers: [
    TransactionRepository,
    BookingRepository,
    OwnerProfileRepository,
    PaymentService,
    VnpayService,
    VnpayIpnService,
    RefundService,
  ],
  exports: [PaymentService, VnpayService, RefundService, TransactionRepository],
})
export class PaymentModule {}
