import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovalRequestEntity } from '~/entities/approval-request.entity';
import { OwnerProfileEntity } from '~/entities/owner-profile.entity';
import { UserEntity } from '~/entities/user.entity';
import { ApprovalRequestRepository } from '~/repositories/approval-request.repository';
import { OwnerProfileRepository } from '~/repositories/owner-profile.repository';
import { UserRepository } from '~/repositories/user.repository';
import { AuthModule } from '../auth/auth.module';
import { AdminOwnerApprovalController } from './controllers/admin-owner-approval.controller';
import { AdminOwnerApprovalService } from './services/admin-owner-approval.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApprovalRequestEntity,
      OwnerProfileEntity,
      UserEntity,
    ]),
    AuthModule,
  ],
  controllers: [AdminOwnerApprovalController],
  providers: [
    ApprovalRequestRepository,
    OwnerProfileRepository,
    UserRepository,
    AdminOwnerApprovalService,
  ],
  exports: [AdminOwnerApprovalService],
})
export class AdminApprovalModule {}
