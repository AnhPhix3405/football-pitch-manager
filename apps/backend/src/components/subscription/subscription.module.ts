import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '~/components/auth/auth.module';
import { SubscriptionPlanEntity } from '~/entities/subscription-plan.entity';
import { SubscriptionEntity } from '~/entities/subscription.entity';
import { UserEntity } from '~/entities/user.entity';
import { SubscriptionPlanRepository } from '~/repositories/subscription-plan.repository';
import { SubscriptionRepository } from '~/repositories/subscription.repository';
import { SubscriptionPlanController } from './controllers/subscription-plan.controller';
import { SubscriptionController } from './controllers/subscription.controller';
import { SubscriptionCronService } from './services/subscription-cron.service';
import { SubscriptionPlanService } from './services/subscription-plan.service';
import { SubscriptionService } from './services/subscription.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SubscriptionPlanEntity,
      SubscriptionEntity,
      UserEntity,
    ]),
    AuthModule,
  ],
  controllers: [SubscriptionPlanController, SubscriptionController],
  providers: [
    SubscriptionRepository,
    SubscriptionPlanRepository,
    SubscriptionPlanService,
    SubscriptionService,
    SubscriptionCronService,
  ],
  exports: [
    SubscriptionRepository,
    SubscriptionPlanRepository,
    SubscriptionPlanService,
    SubscriptionService,
  ],
})
export class SubscriptionModule {}
