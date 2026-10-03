jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { OwnerProfileResponseDto, PublicOwnerProfileResponseDto } from '../dto/owner-profile-response.dto';
import { UpdateOwnerProfileDto } from '../dto/update-owner-profile.dto';
import { OwnerProfileService } from '../services/owner-profile.service';
import { OwnerProfileController } from './owner-profile.controller';

describe('OwnerProfileController', () => {
  let controller: OwnerProfileController;
  let service: jest.Mocked<OwnerProfileService>;

  beforeEach(() => {
    service = {
      getProfileByUserId: jest.fn(),
      updateProfile: jest.fn(),
      getPublicProfileById: jest.fn(),
    } as unknown as jest.Mocked<OwnerProfileService>;

    controller = new OwnerProfileController(service);
  });

  it('getMyProfile should call service.getProfileByUserId with userId', async () => {
    const mockResult = {
      id: 'profile-1',
      userId: 'user-1',
      businessName: 'Field ABC',
    } as OwnerProfileResponseDto;

    service.getProfileByUserId.mockResolvedValue(mockResult);

    const result = await controller.getMyProfile('user-1');

    expect(service.getProfileByUserId).toHaveBeenCalledWith('user-1');
    expect(result).toBe(mockResult);
  });

  it('updateMyProfile should call service.updateProfile with userId and dto', async () => {
    const mockResult = {
      id: 'profile-1',
      userId: 'user-1',
      businessName: 'Updated ABC',
    } as OwnerProfileResponseDto;

    const dto: UpdateOwnerProfileDto = {
      businessName: 'Updated ABC',
      businessLicense: 'LIC-123',
    };

    service.updateProfile.mockResolvedValue(mockResult);

    const result = await controller.updateMyProfile('user-1', dto);

    expect(service.updateProfile).toHaveBeenCalledWith('user-1', dto);
    expect(result).toBe(mockResult);
  });

  it('getPublicProfile should call service.getPublicProfileById with id', async () => {
    const mockResult = {
      id: 'profile-1',
      businessName: 'Public Stadium',
      isVerified: true,
      verifiedAt: new Date(),
    } as PublicOwnerProfileResponseDto;

    service.getPublicProfileById.mockResolvedValue(mockResult);

    const result = await controller.getPublicProfile('profile-1');

    expect(service.getPublicProfileById).toHaveBeenCalledWith('profile-1');
    expect(result).toBe(mockResult);
  });
});
