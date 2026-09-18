import { Module } from '@nestjs/common';
import { HealthController } from './controllers/health.controller';
import { GetHealthService } from './services/get-health.service';

@Module({
  controllers: [HealthController],
  providers: [GetHealthService],
})
export class HealthModule {}
