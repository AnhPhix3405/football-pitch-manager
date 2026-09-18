import { Injectable } from '@nestjs/common';
import { HealthResponseDto } from '../dto/health-response.dto';

@Injectable()
export class GetHealthService {
  execute(): HealthResponseDto {
    return { status: 'ok' };
  }
}
