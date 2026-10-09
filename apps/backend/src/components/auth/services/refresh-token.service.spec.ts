jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { UserEntity } from '~/entities/user.entity';
import { UserRepository } from '~/repositories/user.repository';
import { AuthSessionService } from './auth-session.service';
import { RefreshTokenService } from './refresh-token.service';
import { TokenService } from './token.service';

describe('RefreshTokenService', () => {
  let service: RefreshTokenService;
  let tokenService: jest.Mocked<TokenService>;
  let authSessionService: jest.Mocked<AuthSessionService>;
  let userRepository: jest.Mocked<UserRepository>;
  let configService: jest.Mocked<ConfigService>;

  const rawRefreshToken = 'valid.refresh.token.jwt';
  const newAccessToken = 'new.access.token.jwt';
  const newRefreshToken = 'new.refresh.token.jwt';
  const sampleUserId = 'user-uuid-123';
  const sampleSessionId = 'session-uuid-456';

  beforeEach(() => {
    tokenService = {
      verifyRefreshToken: jest.fn(),
      generateTokenPair: jest.fn(),
    } as unknown as jest.Mocked<TokenService>;

    authSessionService = {
      rotateSession: jest.fn(),
      createSession: jest.fn(),
    } as unknown as jest.Mocked<AuthSessionService>;

    userRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    configService = {
      get: jest.fn((key: string) => {
        if (key === 'jwt.refreshExpiresIn') return '7d';
        return undefined;
      }),
    } as unknown as jest.Mocked<ConfigService>;

    service = new RefreshTokenService(
      tokenService,
      authSessionService,
      userRepository,
      configService,
    );
  });

  it('throws REFRESH_TOKEN_MISSING (401) if refreshToken is empty or missing', async () => {
    await expect(service.execute('')).rejects.toThrow(ApplicationException);

    try {
      await service.execute(null);
      throw new Error('Should have thrown');
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApplicationException);
      expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
      expect(error.getResponse()).toEqual(
        expect.objectContaining({
          code: 'REFRESH_TOKEN_MISSING',
          messageKey: 'error.refreshTokenMissing',
        }),
      );
    }
  });

  it('throws INVALID_CREDENTIALS (401) if user is not found in database', async () => {
    tokenService.verifyRefreshToken.mockResolvedValue({
      sub: sampleUserId,
      email: 'user@example.com',
      role: 'user',
      status: 'active',
      sessionId: sampleSessionId,
      type: 'refresh',
    });
    userRepository.findById.mockResolvedValue(null);

    try {
      await service.execute(rawRefreshToken);
      throw new Error('Should have thrown');
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApplicationException);
      expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
      expect(error.getResponse()).toEqual(
        expect.objectContaining({
          code: 'INVALID_CREDENTIALS',
          messageKey: 'error.invalidCredentials',
        }),
      );
    }
  });

  it('throws ACCOUNT_BANNED (403) if user is banned', async () => {
    tokenService.verifyRefreshToken.mockResolvedValue({
      sub: sampleUserId,
      email: 'user@example.com',
      role: 'user',
      status: 'banned',
      sessionId: sampleSessionId,
      type: 'refresh',
    });
    const mockBannedUser: Partial<UserEntity> = {
      id: sampleUserId,
      email: 'user@example.com',
      role: 'user',
      status: 'banned',
      authProvider: 'local',
    };
    userRepository.findById.mockResolvedValue(mockBannedUser as UserEntity);

    try {
      await service.execute(rawRefreshToken);
      throw new Error('Should have thrown');
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApplicationException);
      expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
      expect(error.getResponse()).toEqual(
        expect.objectContaining({
          code: 'ACCOUNT_BANNED',
          messageKey: 'error.accountBanned',
        }),
      );
    }
  });

  it('successfully refreshes tokens and rotates the existing session', async () => {
    tokenService.verifyRefreshToken.mockResolvedValue({
      sub: sampleUserId,
      email: 'user@example.com',
      role: 'user',
      status: 'active',
      sessionId: sampleSessionId,
      type: 'refresh',
    });

    const mockUser: Partial<UserEntity> = {
      id: sampleUserId,
      email: 'user@example.com',
      role: 'user',
      status: 'active',
      authProvider: 'local',
    };
    userRepository.findById.mockResolvedValue(mockUser as UserEntity);

    tokenService.generateTokenPair.mockResolvedValue({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      tokenType: 'Bearer',
      expiresIn: 900,
    });

    authSessionService.rotateSession.mockResolvedValue({
      sessionId: sampleSessionId,
      userId: sampleUserId,
      expiresAt: new Date(Date.now() + 604800 * 1000),
    });

    const result = await service.execute(rawRefreshToken);

    expect(tokenService.verifyRefreshToken).toHaveBeenCalledWith(rawRefreshToken);
    expect(authSessionService.rotateSession).toHaveBeenCalledWith(
      sampleSessionId,
      rawRefreshToken,
      newRefreshToken,
      604800,
    );
    expect(result).toEqual({
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        tokenType: 'Bearer',
        expiresIn: 900,
      },
      user: {
        id: sampleUserId,
        email: 'user@example.com',
        role: 'user',
        status: 'active',
        authProvider: 'local',
      },
    });
  });
});
