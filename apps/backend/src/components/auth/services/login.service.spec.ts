jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { HttpStatus } from '@nestjs/common';
import { hash } from 'bcrypt';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { UserEntity } from '~/entities/user.entity';
import { UserRepository } from '~/repositories/user.repository';
import { LoginService } from './login.service';

describe('LoginService', () => {
  const repository: jest.Mocked<
    Pick<UserRepository, 'findByEmailWithPasswordHash'>
  > = {
    findByEmailWithPasswordHash: jest.fn(),
  };
  const service = new LoginService(repository as unknown as UserRepository);

  const rawPassword = 'Password@123';
  let hashedPassword = '';

  beforeAll(async () => {
    hashedPassword = await hash(rawPassword, 10);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('authenticates user successfully and normalizes email (uppercase/whitespace)', async () => {
    const mockUser: Partial<UserEntity> = {
      id: '9175df40-fc7c-4d50-b07e-a35417a2eef2',
      email: 'test@example.com',
      passwordHash: hashedPassword,
      role: 'user',
      status: 'active',
      authProvider: 'local',
    };
    repository.findByEmailWithPasswordHash.mockResolvedValue(
      mockUser as UserEntity,
    );

    const result = await service.execute({
      email: '  TeSt@ExAmPlE.cOm  ',
      password: rawPassword,
    });

    expect(repository.findByEmailWithPasswordHash).toHaveBeenCalledWith(
      'test@example.com',
    );
    expect(result).toEqual({
      id: '9175df40-fc7c-4d50-b07e-a35417a2eef2',
      email: 'test@example.com',
      role: 'user',
      status: 'active',
      authProvider: 'local',
    });
    expect(JSON.stringify(result)).not.toContain('passwordHash');
    expect(JSON.stringify(result)).not.toContain(rawPassword);
  });

  it('throws 401 Unauthorized with INVALID_CREDENTIALS when user email does not exist', async () => {
    repository.findByEmailWithPasswordHash.mockResolvedValue(null);

    const promise = service.execute({
      email: 'notfound@example.com',
      password: rawPassword,
    });

    await expectApplicationException(
      promise,
      HttpStatus.UNAUTHORIZED,
      'INVALID_CREDENTIALS',
      'error.invalidCredentials',
      rawPassword,
    );
  });

  it('throws 401 Unauthorized with INVALID_CREDENTIALS when user has no passwordHash (OAuth user)', async () => {
    const mockOAuthUser: Partial<UserEntity> = {
      id: 'oauth-user-id',
      email: 'oauth@example.com',
      passwordHash: null,
      role: 'user',
      status: 'active',
      authProvider: 'google',
    };
    repository.findByEmailWithPasswordHash.mockResolvedValue(
      mockOAuthUser as UserEntity,
    );

    const promise = service.execute({
      email: 'oauth@example.com',
      password: rawPassword,
    });

    await expectApplicationException(
      promise,
      HttpStatus.UNAUTHORIZED,
      'INVALID_CREDENTIALS',
      'error.invalidCredentials',
      rawPassword,
    );
  });

  it('throws 401 Unauthorized with INVALID_CREDENTIALS when password does not match', async () => {
    const mockUser: Partial<UserEntity> = {
      id: 'user-id',
      email: 'test@example.com',
      passwordHash: hashedPassword,
      role: 'user',
      status: 'active',
      authProvider: 'local',
    };
    repository.findByEmailWithPasswordHash.mockResolvedValue(
      mockUser as UserEntity,
    );

    const promise = service.execute({
      email: 'test@example.com',
      password: 'WrongPassword@999',
    });

    await expectApplicationException(
      promise,
      HttpStatus.UNAUTHORIZED,
      'INVALID_CREDENTIALS',
      'error.invalidCredentials',
      'WrongPassword@999',
    );
  });

  it('throws 403 Forbidden with ACCOUNT_BANNED when user status is banned', async () => {
    const mockBannedUser: Partial<UserEntity> = {
      id: 'banned-user-id',
      email: 'banned@example.com',
      passwordHash: hashedPassword,
      role: 'user',
      status: 'banned',
      authProvider: 'local',
    };
    repository.findByEmailWithPasswordHash.mockResolvedValue(
      mockBannedUser as UserEntity,
    );

    const promise = service.execute({
      email: 'banned@example.com',
      password: rawPassword,
    });

    await expectApplicationException(
      promise,
      HttpStatus.FORBIDDEN,
      'ACCOUNT_BANNED',
      'error.accountBanned',
      rawPassword,
    );
  });

  it('ensures no exceptions leak the raw password in error object or message', async () => {
    const sensitivePassword = 'SuperSecretRawPassword!@#123';
    repository.findByEmailWithPasswordHash.mockResolvedValue(null);

    try {
      await service.execute({
        email: 'user@example.com',
        password: sensitivePassword,
      });
      throw new Error('Should have thrown');
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(ApplicationException);
      const appError = error as ApplicationException;
      const errorResponse = JSON.stringify(appError.getResponse());
      expect(errorResponse).not.toContain(sensitivePassword);
    }
  });
});

const expectApplicationException = async (
  promise: Promise<unknown>,
  expectedStatus: HttpStatus,
  expectedCode: string,
  expectedMessageKey: string,
  sensitivePayload?: string,
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
    if (sensitivePayload) {
      expect(JSON.stringify(appError.getResponse())).not.toContain(
        sensitivePayload,
      );
    }
  }
};
