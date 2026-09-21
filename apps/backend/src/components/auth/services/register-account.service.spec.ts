jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { HttpStatus } from '@nestjs/common';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { UserProfileEntity } from '~/entities/user-profile.entity';
import { UserEntity } from '~/entities/user.entity';
import {
  DuplicateRegistrationFieldError,
  UserRepository,
} from '~/repositories/user.repository';
import { RegisterAccountService } from './register-account.service';

describe('RegisterAccountService', () => {
  const repository: jest.Mocked<
    Pick<UserRepository, 'findByEmail' | 'findByPhone' | 'createLocalAccount'>
  > = {
    findByEmail: jest.fn(),
    findByPhone: jest.fn(),
    createLocalAccount: jest.fn(),
  };
  const service = new RegisterAccountService(
    repository as unknown as UserRepository,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    repository.findByEmail.mockResolvedValue(null);
    repository.findByPhone.mockResolvedValue(null);
  });

  it('normalizes input, hashes the password, and returns no password hash', async () => {
    repository.createLocalAccount.mockImplementation(
      ({ email, phone, passwordHash, fullName }) =>
        Promise.resolve({
          user: {
            id: '9175df40-fc7c-4d50-b07e-a35417a2eef2',
            email,
            phone,
            passwordHash,
            role: 'user',
            authProvider: 'local',
          } as UserEntity,
          profile: { fullName } as UserProfileEntity,
        }),
    );

    const result = await service.execute({
      email: 'USER@Example.com',
      password: 'Password@123',
      phone: '0912345678',
      fullName: 'Nguyen Van A',
    });
    expect(repository.createLocalAccount).toHaveBeenCalledWith({
      email: 'user@example.com',
      phone: '0912345678',
      passwordHash: expect.stringMatching(/^\$2[aby]\$/) as string,
      fullName: 'Nguyen Van A',
    });
    const passwordHash =
      repository.createLocalAccount.mock.calls[0]?.[0].passwordHash;
    expect(passwordHash).not.toBe('Password@123');
    expect(result).toEqual({
      messageKey: 'success.accountRegistered',
      data: {
        id: '9175df40-fc7c-4d50-b07e-a35417a2eef2',
        email: 'user@example.com',
        role: 'user',
        authProvider: 'local',
        profile: { fullName: 'Nguyen Van A' },
      },
    });
    expect(JSON.stringify(result)).not.toContain('passwordHash');
  });

  it.each([
    ['email', 'EMAIL_ALREADY_EXISTS'],
    ['phone', 'PHONE_ALREADY_EXISTS'],
  ] as const)(
    'returns conflict for a duplicate %s pre-check',
    async (field, code) => {
      repository[
        field === 'email' ? 'findByEmail' : 'findByPhone'
      ].mockResolvedValue({});

      const promise = service.execute({
        email: 'user@example.com',
        password: 'Password@123',
        phone: '0912345678',
      });
      await expectApplicationConflict(promise, code);
      expect(repository.createLocalAccount).not.toHaveBeenCalled();
    },
  );

  it('maps a concurrent unique violation to conflict', async () => {
    repository.createLocalAccount.mockRejectedValue(
      new DuplicateRegistrationFieldError('email'),
    );

    const promise = service.execute({
      email: 'user@example.com',
      password: 'Password@123',
    });
    await expectApplicationConflict(promise, 'EMAIL_ALREADY_EXISTS');
  });
});

const expectApplicationConflict = async (
  promise: Promise<unknown>,
  code: string,
): Promise<void> => {
  try {
    await promise;
    throw new Error('Expected registration to fail');
  } catch (error: unknown) {
    expect(error).toBeInstanceOf(ApplicationException);
    const applicationError = error as ApplicationException;
    expect(applicationError.getStatus()).toBe(HttpStatus.CONFLICT);
    expect(applicationError.getResponse()).toEqual(
      expect.objectContaining({ code }),
    );
  }
};
