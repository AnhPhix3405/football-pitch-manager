import { Controller, Get } from '@nestjs/common';
import { HealthResponseDto } from '../dto/health-response.dto';
import { GetHealthService } from '../services/get-health.service';

@Controller()
export class HealthController {
  constructor(private readonly getHealthService: GetHealthService) {}

  @Get()
  getHealth(): HealthResponseDto {
    return this.getHealthService.execute();
  }
}
