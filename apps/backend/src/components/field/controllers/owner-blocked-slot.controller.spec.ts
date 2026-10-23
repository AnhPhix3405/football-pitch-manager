/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { OwnerBlockedSlotController } from './owner-blocked-slot.controller';
import { OwnerBlockedSlotService } from '../services/owner-blocked-slot.service';

describe('OwnerBlockedSlotController', () => {
  let controller: OwnerBlockedSlotController;
  let service: jest.Mocked<OwnerBlockedSlotService>;

  beforeEach(() => {
    service = {
      createBlockedSlot: jest.fn(),
      getBlockedSlots: jest.fn(),
      deleteBlockedSlot: jest.fn(),
    } as unknown as jest.Mocked<OwnerBlockedSlotService>;

    controller = new OwnerBlockedSlotController(service);
  });

  it('delegates createBlockedSlot to service', async () => {
    const mockRes = { id: 'slot-1' } as any;
    service.createBlockedSlot.mockResolvedValue(mockRes);

    const result = await controller.createBlockedSlot('field-1', 'court-1', {
      blockedDate: '2026-10-25',
      startTime: '08:00',
      endTime: '10:00',
    });

    expect(service.createBlockedSlot).toHaveBeenCalledWith(
      'field-1',
      'court-1',
      {
        blockedDate: '2026-10-25',
        startTime: '08:00',
        endTime: '10:00',
      },
    );
    expect(result).toBe(mockRes);
  });
});
