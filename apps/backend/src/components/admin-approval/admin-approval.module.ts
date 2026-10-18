import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovalRequestEntity } from '~/entities/approval-request.entity';
import { FieldEntity } from '~/entities/field.entity';
import { OwnerProfileEntity } from '~/entities/owner-profile.entity';
import { UserEntity } from '~/entities/user.entity';
import { ApprovalRequestRepository } from '~/repositories/approval-request.repository';
import { FieldRepository } from '~/repositories/field.repository';
import { OwnerProfileRepository } from '~/repositories/owner-profile.repository';
import { UserRepository } from '~/repositories/user.repository';
import { AuthModule } from '../auth/auth.module';
import { AdminFieldApprovalController } from './controllers/admin-field-approval.controller';
import { AdminOwnerApprovalController } from './controllers/admin-owner-approval.controller';
import { AdminFieldApprovalService } from './services/admin-field-approval.service';
import { AdminOwnerApprovalService } from './services/admin-owner-approval.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApprovalRequestEntity,
      OwnerProfileEntity,
      UserEntity,
      FieldEntity,
    ]),
    AuthModule,
  ],
  controllers: [AdminOwnerApprovalController, AdminFieldApprovalController],
  providers: [
    ApprovalRequestRepository,
    OwnerProfileRepository,
    UserRepository,
    FieldRepository,
    AdminOwnerApprovalService,
    AdminFieldApprovalService,
  ],
  exports: [AdminOwnerApprovalService, AdminFieldApprovalService],
})
export class AdminApprovalModule {}
