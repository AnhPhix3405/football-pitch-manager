jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import {
  OwnerRegistrationResponseDto,
  OwnerRegistrationStatusResponseDto,
} from '../dto/owner-registration-response.dto';
import { RegisterOwnerDto } from '../dto/register-owner.dto';
import { OwnerRegistrationService } from '../services/owner-registration.service';
import { OwnerRegistrationController } from './owner-registration.controller';

describe('OwnerRegistrationController', () => {
  let controller: OwnerRegistrationController;
  let service: jest.Mocked<OwnerRegistrationService>;

  beforeEach(() => {
    service = {
      registerOwner: jest.fn(),
      getRegistrationStatus: jest.fn(),
    } as unknown as jest.Mocked<OwnerRegistrationService>;

    controller = new OwnerRegistrationController(service);
  });

  it('register should call service.registerOwner with userId and dto', async () => {
    const dto: RegisterOwnerDto = {
      businessName: 'Tan Binh Sport',
      businessLicense: 'GPKD-123456',
      bankAccount: 'VCB-001',
      note: 'Please approve',
    };

    const mockResponse: OwnerRegistrationResponseDto = {
      id: 'req-1',
      type: 'owner_register',
      targetId: 'profile-1',
      requestedBy: 'user-1',
      status: 'pending',
      note: 'Please approve',
      createdAt: new Date(),
    };

    service.registerOwner.mockResolvedValue(mockResponse);

    const result = await controller.register('user-1', dto);

    expect(service.registerOwner).toHaveBeenCalledWith('user-1', dto);
    expect(result).toBe(mockResponse);
  });

  it('getStatus should call service.getRegistrationStatus with userId', async () => {
    const mockStatus: OwnerRegistrationStatusResponseDto = {
      hasPendingRequest: true,
      currentRole: 'user',
      latestRequest: {
        id: 'req-1',
        type: 'owner_register',
        targetId: 'profile-1',
        requestedBy: 'user-1',
        status: 'pending',
        note: null,
        createdAt: new Date(),
      },
      profile: null,
    };

    service.getRegistrationStatus.mockResolvedValue(mockStatus);

    const result = await controller.getStatus('user-1');

    expect(service.getRegistrationStatus).toHaveBeenCalledWith('user-1');
    expect(result).toBe(mockStatus);
  });
});
