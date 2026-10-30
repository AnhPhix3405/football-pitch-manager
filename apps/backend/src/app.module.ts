import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { I18nModule } from 'nestjs-i18n';
import { StorageModule } from './common/storage/storage.module';
import { AdminApprovalModule } from './components/admin-approval/admin-approval.module';
import { AuthModule } from './components/auth/auth.module';
import { BookingModule } from './components/booking/booking.module';
import { ChatModule } from './components/chat/chat.module';
import { FieldModule } from './components/field/field.module';
import { HealthModule } from './components/health/health.module';
import { NotificationModule } from './components/notification/notification.module';
import { OwnerProfileModule } from './components/owner-profile/owner-profile.module';
import { PaymentModule } from './components/payment/payment.module';
import { PostModule } from './components/post/post.module';
import { UserProfileModule } from './components/user-profile/user-profile.module';
import { appConfig } from './config/app.config';
import { validateEnvironment } from './config/environment.validation';
import { i18nConfig } from './config/i18n.config';
import { jwtConfig } from './config/jwt.config';
import { paymentConfig } from './config/payment.config';
import { storageConfig } from './config/storage.config';
import { typeOrmDataSourceOptions } from './database/config/typeorm.options';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, jwtConfig, storageConfig, paymentConfig],
      validate: validateEnvironment,
    }),
    ScheduleModule.forRoot(),
    I18nModule.forRoot(i18nConfig),
    TypeOrmModule.forRootAsync({
      useFactory: typeOrmDataSourceOptions,
    }),
    StorageModule,
    AuthModule,
    HealthModule,
    OwnerProfileModule,
    UserProfileModule,
    AdminApprovalModule,
    FieldModule,
    BookingModule,
    PaymentModule,
    ChatModule,
    PostModule,
    NotificationModule,
  ],
})
export class AppModule {}
