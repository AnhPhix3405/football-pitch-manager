import { HttpStatus, Injectable } from '@nestjs/common';
import { hash } from 'bcrypt';
import { ApplicationException } from '~/common/exceptions/application.exception';
import {
  DuplicateRegistrationField,
  DuplicateRegistrationFieldError,
  UserRepository,
} from '~/repositories/user.repository';
import { RegisterRequestDto } from '../dto/register-request.dto';
import { RegisterResponseDto } from '../dto/register-response.dto';

const PASSWORD_HASH_ROUNDS = 12;

@Injectable()
export class RegisterAccountService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: RegisterRequestDto): Promise<RegisterResponseDto> {
    const email = input.email.toLowerCase();
    const phone = input.phone ?? null;

    if (await this.userRepository.findByEmail(email)) {
      throw this.duplicateFieldException('email');
    }
    if (phone && (await this.userRepository.findByPhone(phone))) {
      throw this.duplicateFieldException('phone');
    }

    const passwordHash = await hash(input.password, PASSWORD_HASH_ROUNDS);

    try {
      const { user, profile } = await this.userRepository.createLocalAccount({
        email,
        phone,
        passwordHash,
        fullName: input.fullName ?? null,
      });

      return {
        messageKey: 'success.accountRegistered',
        data: {
          id: user.id,
          email: user.email,
          role: user.role,
          authProvider: user.authProvider,
          profile: { fullName: profile.fullName },
        },
      };
    } catch (error: unknown) {
      if (error instanceof DuplicateRegistrationFieldError) {
        throw this.duplicateFieldException(error.field);
      }

      throw error;
    }
  }

  private duplicateFieldException(
    field: DuplicateRegistrationField,
  ): ApplicationException {
    return new ApplicationException({
      code: `${field.toUpperCase()}_ALREADY_EXISTS`,
      messageKey: `error.${field}AlreadyExists`,
      status: HttpStatus.CONFLICT,
    });
  }
}
