jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { HttpStatus } from '@nestjs/common';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { UserProfileEntity } from '~/entities/user-profile.entity';
import { UserEntity } from '~/entities/user.entity';
import { UserRepository } from '~/repositories/user.repository';
import { GoogleAuthService } from './google-auth.service';
import { LoginGoogleService } from './login-google.service';

describe('LoginGoogleService', () => {
  const googleAuthService: jest.Mocked<Pick<GoogleAuthService, 'verify'>> = {
    verify: jest.fn(),
  };
  const userRepository: jest.Mocked<
    Pick<
      UserRepository,
      | 'findByProvider'
      | 'findByEmail'
      | 'linkOAuthProvider'
      | 'createOAuthAccount'
    >
  > = {
    findByProvider: jest.fn(),
    findByEmail: jest.fn(),
    linkOAuthProvider: jest.fn(),
    createOAuthAccount: jest.fn(),
  };

  const service = new LoginGoogleService(
    googleAuthService as unknown as GoogleAuthService,
    userRepository as unknown as UserRepository,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws 401 Unauthorized with GOOGLE_TOKEN_INVALID when Google verify fails', async () => {
    googleAuthService.verify.mockResolvedValue(null);

    const promise = service.execute({ idToken: 'invalid-token' });

    await expectApplicationException(
      promise,
      HttpStatus.UNAUTHORIZED,
      'GOOGLE_TOKEN_INVALID',
      'error.googleTokenInvalid',
    );
  });

  it('logs in successfully when user is already linked with Google provider', async () => {
    googleAuthService.verify.mockResolvedValue({
      providerId: 'google-sub-123',
      email: 'user@gmail.com',
      name: 'Google User',
      avatar: 'https://lh3.googleusercontent.com/photo.jpg',
    });

    const existingGoogleUser: Partial<UserEntity> = {
      id: 'existing-google-user-id',
      email: 'user@gmail.com',
      role: 'user',
      status: 'active',
      authProvider: 'google',
      providerId: 'google-sub-123',
    };
    userRepository.findByProvider.mockResolvedValue(
      existingGoogleUser as UserEntity,
    );

    const result = await service.execute({ idToken: 'valid-google-token' });

    expect(userRepository.findByProvider).toHaveBeenCalledWith(
      'google',
      'google-sub-123',
    );
    expect(userRepository.findByEmail).not.toHaveBeenCalled();
    expect(result).toEqual({
      id: 'existing-google-user-id',
      email: 'user@gmail.com',
      role: 'user',
      status: 'active',
      authProvider: 'google',
      providerId: 'google-sub-123',
    });
    expect(JSON.stringify(result)).not.toContain('passwordHash');
  });

  it('links Google account to existing user when matching email exists', async () => {
    googleAuthService.verify.mockResolvedValue({
      providerId: 'google-sub-456',
      email: 'localuser@example.com',
      name: 'Local User',
      avatar: null,
    });

    userRepository.findByProvider.mockResolvedValue(null);

    const existingLocalUser: Partial<UserEntity> = {
      id: 'local-user-id',
      email: 'localuser@example.com',
      role: 'user',
      status: 'active',
      authProvider: 'local',
      providerId: null,
    };
    userRepository.findByEmail.mockResolvedValue(
      existingLocalUser as UserEntity,
    );

    const linkedUser: Partial<UserEntity> = {
      ...existingLocalUser,
      authProvider: 'google',
      providerId: 'google-sub-456',
    };
    userRepository.linkOAuthProvider.mockResolvedValue(
      linkedUser as UserEntity,
    );

    const result = await service.execute({ idToken: 'valid-google-token' });

    expect(userRepository.findByEmail).toHaveBeenCalledWith(
      'localuser@example.com',
    );
    expect(userRepository.linkOAuthProvider).toHaveBeenCalledWith(
      'local-user-id',
      'google',
      'google-sub-456',
    );
    expect(result).toEqual({
      id: 'local-user-id',
      email: 'localuser@example.com',
      role: 'user',
      status: 'active',
      authProvider: 'google',
      providerId: 'google-sub-456',
    });
  });

  it('creates new User and UserProfile when neither providerId nor email exists', async () => {
    googleAuthService.verify.mockResolvedValue({
      providerId: 'google-sub-789',
      email: 'newuser@gmail.com',
      name: 'New Google User',
      avatar: 'https://lh3.googleusercontent.com/avatar.png',
    });

    userRepository.findByProvider.mockResolvedValue(null);
    userRepository.findByEmail.mockResolvedValue(null);

    const createdUser: Partial<UserEntity> = {
      id: 'new-user-id',
      email: 'newuser@gmail.com',
      role: 'user',
      status: 'active',
      authProvider: 'google',
      providerId: 'google-sub-789',
    };
    const createdProfile: Partial<UserProfileEntity> = {
      id: 'profile-id',
      userId: 'new-user-id',
      fullName: 'New Google User',
      avatarUrl: 'https://lh3.googleusercontent.com/avatar.png',
    };
    userRepository.createOAuthAccount.mockResolvedValue({
      user: createdUser as UserEntity,
      profile: createdProfile as UserProfileEntity,
    });

    const result = await service.execute({ idToken: 'new-user-token' });

    expect(userRepository.createOAuthAccount).toHaveBeenCalledWith({
      email: 'newuser@gmail.com',
      authProvider: 'google',
      providerId: 'google-sub-789',
      fullName: 'New Google User',
      avatarUrl: 'https://lh3.googleusercontent.com/avatar.png',
    });
    expect(result).toEqual({
      id: 'new-user-id',
      email: 'newuser@gmail.com',
      role: 'user',
      status: 'active',
      authProvider: 'google',
      providerId: 'google-sub-789',
    });
    expect(JSON.stringify(result)).not.toContain('passwordHash');
  });

  it('throws 403 Forbidden with ACCOUNT_BANNED when user status is banned', async () => {
    googleAuthService.verify.mockResolvedValue({
      providerId: 'banned-google-sub',
      email: 'banned@gmail.com',
      name: 'Banned User',
      avatar: null,
    });

    const bannedUser: Partial<UserEntity> = {
      id: 'banned-user-id',
      email: 'banned@gmail.com',
      role: 'user',
      status: 'banned',
      authProvider: 'google',
      providerId: 'banned-google-sub',
    };
    userRepository.findByProvider.mockResolvedValue(bannedUser as UserEntity);

    const promise = service.execute({ idToken: 'banned-token' });

    await expectApplicationException(
      promise,
      HttpStatus.FORBIDDEN,
      'ACCOUNT_BANNED',
      'error.accountBanned',
    );
  });
});

const expectApplicationException = async (
  promise: Promise<unknown>,
  expectedStatus: HttpStatus,
  expectedCode: string,
  expectedMessageKey: string,
): Promise<void> => {
  try {
    await promise;
    throw new Error('Expected operation to fail with ApplicationException');
  } catch (error: unknown) {
    expect(error).toBeInstanceOf(ApplicationException);
    const appError = error as ApplicationException;
    expect(appError.getStatus()).toBe(expectedStatus);
    expect(appError.getResponse()).toEqual(
      expect.objectContaining({
        code: expectedCode,
        messageKey: expectedMessageKey,
      }),
    );
  }
};
