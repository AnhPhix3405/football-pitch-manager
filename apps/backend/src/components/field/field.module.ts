import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovalRequestEntity } from '~/entities/approval-request.entity';
import { FieldBlockedSlotEntity } from '~/entities/field-blocked-slot.entity';
import { FieldCourtEntity } from '~/entities/field-court.entity';
import { FieldEntity } from '~/entities/field.entity';
import { FieldImageEntity } from '~/entities/field-image.entity';
import { FieldOpeningHourEntity } from '~/entities/field-opening-hour.entity';
import { FieldServiceEntity } from '~/entities/field-service.entity';
import { ApprovalRequestRepository } from '~/repositories/approval-request.repository';
import { FieldBlockedSlotRepository } from '~/repositories/field-blocked-slot.repository';
import { FieldCourtRepository } from '~/repositories/field-court.repository';
import { FieldImageRepository } from '~/repositories/field-image.repository';
import { FieldOpeningHourRepository } from '~/repositories/field-opening-hour.repository';
import { FieldRepository } from '~/repositories/field.repository';
import { FieldServiceRepository } from '~/repositories/field-service.repository';
import { AuthModule } from '../auth/auth.module';
import { FieldController } from './controllers/field.controller';
import { OwnerBlockedSlotController } from './controllers/owner-blocked-slot.controller';
import { OwnerFieldCourtController } from './controllers/owner-field-court.controller';
import { OwnerFieldImageController } from './controllers/owner-field-image.controller';
import { OwnerFieldOpeningHourController } from './controllers/owner-field-opening-hour.controller';
import { OwnerFieldServiceController } from './controllers/owner-field-service.controller';
import { OwnerFieldController } from './controllers/owner-field.controller';
import { FieldOwnershipGuard } from './guards/field-ownership.guard';
import { FieldService } from './services/field.service';
import { OwnerBlockedSlotService } from './services/owner-blocked-slot.service';
import { OwnerFieldCourtService } from './services/owner-field-court.service';
import { OwnerFieldImageService } from './services/owner-field-image.service';
import { OwnerFieldOpeningHourService } from './services/owner-field-opening-hour.service';
import { OwnerFieldServiceService } from './services/owner-field-service.service';
import { OwnerFieldService } from './services/owner-field.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FieldEntity,
      ApprovalRequestEntity,
      FieldCourtEntity,
      FieldImageEntity,
      FieldServiceEntity,
      FieldOpeningHourEntity,
      FieldBlockedSlotEntity,
    ]),
    AuthModule,
  ],
  controllers: [
    OwnerFieldController,
    FieldController,
    OwnerFieldCourtController,
    OwnerFieldImageController,
    OwnerFieldServiceController,
    OwnerFieldOpeningHourController,
    OwnerBlockedSlotController,
  ],
  providers: [
    FieldRepository,
    ApprovalRequestRepository,
    FieldCourtRepository,
    FieldImageRepository,
    FieldServiceRepository,
    FieldOpeningHourRepository,
    FieldBlockedSlotRepository,
    OwnerFieldService,
    OwnerFieldCourtService,
    OwnerFieldImageService,
    OwnerFieldServiceService,
    OwnerFieldOpeningHourService,
    OwnerBlockedSlotService,
    FieldService,
    FieldOwnershipGuard,
  ],
  exports: [
    FieldRepository,
    FieldCourtRepository,
    FieldImageRepository,
    FieldServiceRepository,
    FieldOpeningHourRepository,
    FieldBlockedSlotRepository,
    OwnerFieldService,
    OwnerFieldCourtService,
    OwnerFieldImageService,
    OwnerFieldServiceService,
    OwnerFieldOpeningHourService,
    OwnerBlockedSlotService,
    FieldService,
    FieldOwnershipGuard,
    TypeOrmModule,
  ],
})
export class FieldModule {}
