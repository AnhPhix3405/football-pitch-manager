import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovalRequestEntity } from '~/entities/approval-request.entity';
import { FieldEntity } from '~/entities/field.entity';
import { ApprovalRequestRepository } from '~/repositories/approval-request.repository';
import { FieldRepository } from '~/repositories/field.repository';
import { AuthModule } from '../auth/auth.module';
import { FieldController } from './controllers/field.controller';
import { OwnerFieldController } from './controllers/owner-field.controller';
import { FieldService } from './services/field.service';
import { OwnerFieldService } from './services/owner-field.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FieldEntity, ApprovalRequestEntity]),
    AuthModule,
  ],
  controllers: [OwnerFieldController, FieldController],
  providers: [
    FieldRepository,
    ApprovalRequestRepository,
    OwnerFieldService,
    FieldService,
  ],
  exports: [FieldRepository, OwnerFieldService, FieldService],
})
export class FieldModule {}
