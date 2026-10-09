import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FieldEntity } from '~/entities/field.entity';
import { FieldRepository } from '~/repositories/field.repository';
import { AuthModule } from '../auth/auth.module';
import { FieldController } from './controllers/field.controller';
import { OwnerFieldController } from './controllers/owner-field.controller';
import { FieldService } from './services/field.service';
import { OwnerFieldService } from './services/owner-field.service';

@Module({
  imports: [TypeOrmModule.forFeature([FieldEntity]), AuthModule],
  controllers: [OwnerFieldController, FieldController],
  providers: [FieldRepository, OwnerFieldService, FieldService],
  exports: [FieldRepository, OwnerFieldService, FieldService],
})
export class FieldModule {}
