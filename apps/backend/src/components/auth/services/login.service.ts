import { HttpStatus, Injectable } from '@nestjs/common';
import { compare } from 'bcrypt';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { UserRepository } from '~/repositories/user.repository';
import { LoginRequestDto } from '../dto/login-request.dto';
import { AuthenticatedUserDto } from '../dto/login-response.dto';

@Injectable()
export class LoginService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: LoginRequestDto): Promise<AuthenticatedUserDto> {
    const email = input.email.trim().toLowerCase();
    const user = await this.userRepository.findByEmailWithPasswordHash(email);

    if (!user || !user.passwordHash) {
      throw new ApplicationException({
        code: 'INVALID_CREDENTIALS',
        messageKey: 'error.invalidCredentials',
        status: HttpStatus.UNAUTHORIZED,
      });
    }

    if (user.status === 'banned') {
      throw new ApplicationException({
        code: 'ACCOUNT_BANNED',
        messageKey: 'error.accountBanned',
        status: HttpStatus.FORBIDDEN,
      });
    }

    const isPasswordValid = await compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new ApplicationException({
        code: 'INVALID_CREDENTIALS',
        messageKey: 'error.invalidCredentials',
        status: HttpStatus.UNAUTHORIZED,
      });
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      authProvider: user.authProvider,
    };
  }
}
