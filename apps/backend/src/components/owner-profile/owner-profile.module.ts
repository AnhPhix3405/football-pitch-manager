import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovalRequestEntity } from '~/entities/approval-request.entity';
import { OwnerProfileEntity } from '~/entities/owner-profile.entity';
import { UserEntity } from '~/entities/user.entity';
import { ApprovalRequestRepository } from '~/repositories/approval-request.repository';
import { OwnerProfileRepository } from '~/repositories/owner-profile.repository';
import { UserRepository } from '~/repositories/user.repository';
import { AuthModule } from '../auth/auth.module';
import { OwnerProfileController } from './controllers/owner-profile.controller';
import { OwnerRegistrationController } from './controllers/owner-registration.controller';
import { OwnerProfileService } from './services/owner-profile.service';
import { OwnerRegistrationService } from './services/owner-registration.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OwnerProfileEntity,
      ApprovalRequestEntity,
      UserEntity,
    ]),
    AuthModule,
  ],
  controllers: [OwnerProfileController, OwnerRegistrationController],
  providers: [
    OwnerProfileRepository,
    ApprovalRequestRepository,
    UserRepository,
    OwnerProfileService,
    OwnerRegistrationService,
  ],
  exports: [
    OwnerProfileRepository,
    ApprovalRequestRepository,
    OwnerProfileService,
    OwnerRegistrationService,
  ],
})
export class OwnerProfileModule {}
