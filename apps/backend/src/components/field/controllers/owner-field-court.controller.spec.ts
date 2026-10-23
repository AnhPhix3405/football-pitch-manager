/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { OwnerFieldCourtController } from './owner-field-court.controller';
import { OwnerFieldCourtService } from '../services/owner-field-court.service';

describe('OwnerFieldCourtController', () => {
  let controller: OwnerFieldCourtController;
  let service: jest.Mocked<OwnerFieldCourtService>;

  beforeEach(() => {
    service = {
      createCourt: jest.fn(),
      getCourts: jest.fn(),
      getCourtDetail: jest.fn(),
      updateCourt: jest.fn(),
      deleteCourt: jest.fn(),
    } as unknown as jest.Mocked<OwnerFieldCourtService>;

    controller = new OwnerFieldCourtController(service);
  });

  it('delegates createCourt to service', async () => {
    const mockRes = { id: 'court-1', name: 'Sân 1' } as any;
    service.createCourt.mockResolvedValue(mockRes);

    const result = await controller.createCourt('field-1', {
      name: 'Sân 1',
      type: '5',
    });

    expect(service.createCourt).toHaveBeenCalledWith('field-1', {
      name: 'Sân 1',
      type: '5',
    });
    expect(result).toBe(mockRes);
  });

  it('delegates getCourts to service', async () => {
    const mockRes = [{ id: 'court-1' }] as any;
    service.getCourts.mockResolvedValue(mockRes);

    const result = await controller.getCourts('field-1', '5', 'active');

    expect(service.getCourts).toHaveBeenCalledWith('field-1', {
      type: '5',
      status: 'active',
    });
    expect(result).toBe(mockRes);
  });
});
