import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminOverviewController } from './controllers/admin-overview.controller';
import { AdminOverviewService } from './services/admin-overview.service';

@Module({
  imports: [AuthModule],
  controllers: [AdminOverviewController],
  providers: [AdminOverviewService],
  exports: [AdminOverviewService],
})
export class AdminOverviewModule {}
