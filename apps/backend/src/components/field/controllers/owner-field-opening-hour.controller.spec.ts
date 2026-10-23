/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { OwnerFieldOpeningHourController } from './owner-field-opening-hour.controller';
import { OwnerFieldOpeningHourService } from '../services/owner-field-opening-hour.service';

describe('OwnerFieldOpeningHourController', () => {
  let controller: OwnerFieldOpeningHourController;
  let service: jest.Mocked<OwnerFieldOpeningHourService>;

  beforeEach(() => {
    service = {
      upsertOpeningHours: jest.fn(),
      getOpeningHours: jest.fn(),
    } as unknown as jest.Mocked<OwnerFieldOpeningHourService>;

    controller = new OwnerFieldOpeningHourController(service);
  });

  it('delegates upsertOpeningHours to service', async () => {
    const mockRes = [{ id: 'h-1', dayOfWeek: 1 }] as any;
    service.upsertOpeningHours.mockResolvedValue(mockRes);

    const result = await controller.upsertOpeningHours('field-1', {
      hours: [
        {
          dayOfWeek: 1,
          openTime: '06:00',
          closeTime: '22:00',
          isClosed: false,
        },
      ],
    });

    expect(service.upsertOpeningHours).toHaveBeenCalled();
    expect(result).toBe(mockRes);
  });
});
