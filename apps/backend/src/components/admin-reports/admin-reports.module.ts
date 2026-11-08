import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogEntity } from '../../entities/audit-log.entity';
import { AuthModule } from '../auth/auth.module';
import { AdminReportsController } from './controllers/admin-reports.controller';
import { AdminReportsService } from './services/admin-reports.service';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([AuditLogEntity])],
  controllers: [AdminReportsController],
  providers: [AdminReportsService],
  exports: [AdminReportsService],
})
export class AdminReportsModule {}
