/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { OwnerFieldServiceController } from './owner-field-service.controller';
import { OwnerFieldServiceService } from '../services/owner-field-service.service';

describe('OwnerFieldServiceController', () => {
  let controller: OwnerFieldServiceController;
  let service: jest.Mocked<OwnerFieldServiceService>;

  beforeEach(() => {
    service = {
      createService: jest.fn(),
      getServices: jest.fn(),
      updateService: jest.fn(),
      deleteService: jest.fn(),
    } as unknown as jest.Mocked<OwnerFieldServiceService>;

    controller = new OwnerFieldServiceController(service);
  });

  it('delegates createService to service', async () => {
    const mockRes = { id: 'srv-1', name: 'Nước' } as any;
    service.createService.mockResolvedValue(mockRes);

    const result = await controller.createService('field-1', {
      name: 'Nước',
      price: 10000,
    });

    expect(service.createService).toHaveBeenCalledWith('field-1', {
      name: 'Nước',
      price: 10000,
    });
    expect(result).toBe(mockRes);
  });
});
