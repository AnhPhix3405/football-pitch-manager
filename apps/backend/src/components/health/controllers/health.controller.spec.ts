import { Test, TestingModule } from '@nestjs/testing';
import { GetHealthService } from '../services/get-health.service';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [GetHealthService],
    }).compile();

    controller = module.get(HealthController);
  });

  it('returns the application health', () => {
    expect(controller.getHealth()).toEqual({ status: 'ok' });
  });
});
