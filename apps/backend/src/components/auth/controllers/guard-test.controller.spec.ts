import { Test, TestingModule } from '@nestjs/testing';
import { GuardTestController } from './guard-test.controller';
import { TokenService } from '../services/token.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

describe('GuardTestController', () => {
  let controller: GuardTestController;

  const mockTokenService = {
    verifyAccessToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GuardTestController],
      providers: [
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
      ],
    }).compile();

    controller = module.get<GuardTestController>(GuardTestController);
  });

  const mockUser: JwtPayload = {
    sub: 'user-uuid-123',
    email: 'user@example.com',
    role: 'user',
    status: 'active',
  };

  it('getPublic returns public message', () => {
    expect(controller.getPublic()).toEqual({
      message: 'Public endpoint accessible without authentication',
    });
  });

  it('getProfile returns user payload', () => {
    expect(controller.getProfile(mockUser)).toEqual({
      message: 'Profile retrieved successfully',
      user: mockUser,
    });
  });

  it('getUserId returns user id string', () => {
    expect(controller.getUserId('user-uuid-123')).toEqual({
      userId: 'user-uuid-123',
    });
  });

  it('getOwnerOnly returns owner resource response', () => {
    const ownerUser = { ...mockUser, role: 'owner' };
    expect(controller.getOwnerOnly(ownerUser)).toEqual({
      message: 'Owner resource accessed successfully',
      user: ownerUser,
    });
  });

  it('getAdminOnly returns admin resource response', () => {
    const adminUser = { ...mockUser, role: 'admin' };
    expect(controller.getAdminOnly(adminUser)).toEqual({
      message: 'Admin resource accessed successfully',
      user: adminUser,
    });
  });

  it('getActiveOnly returns active status response', () => {
    expect(controller.getActiveOnly(mockUser)).toEqual({
      message: 'Active account verified',
      user: mockUser,
    });
  });
});
