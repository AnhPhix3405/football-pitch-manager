import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiHealthCheckDoc,
  ApiHealthControllerDoc,
} from '../docs/health.doc';
import { HealthResponseDto } from '../dto/health-response.dto';
import { GetHealthService } from '../services/get-health.service';

@ApiHealthControllerDoc()
@Controller()
export class HealthController {
  constructor(private readonly getHealthService: GetHealthService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiHealthCheckDoc()
  getHealth(): HealthResponseDto {
    return this.getHealthService.execute();
  }
}
