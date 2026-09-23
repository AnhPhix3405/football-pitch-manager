import { HttpStatus, Injectable } from '@nestjs/common';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { UserRepository } from '~/repositories/user.repository';
import { GoogleLoginRequestDto } from '../dto/google-login-request.dto';
import { GoogleAuthenticatedUserDto } from '../dto/google-login-response.dto';
import { GoogleAuthService } from './google-auth.service';

@Injectable()
export class LoginGoogleService {
  constructor(
    private readonly googleAuthService: GoogleAuthService,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(
    input: GoogleLoginRequestDto,
  ): Promise<GoogleAuthenticatedUserDto> {
    const payload = await this.googleAuthService.verify(input.idToken);
    if (!payload) {
      throw new ApplicationException({
        code: 'GOOGLE_TOKEN_INVALID',
        messageKey: 'error.googleTokenInvalid',
        status: HttpStatus.UNAUTHORIZED,
      });
    }

    const { providerId, email, name, avatar } = payload;

    // 1. Tìm user theo authProvider='google' và providerId
    let user = await this.userRepository.findByProvider('google', providerId);

    if (!user) {
      // 2. Nếu chưa có, tìm user theo email
      const existingUserByEmail = await this.userRepository.findByEmail(email);

      if (existingUserByEmail) {
        // Link existing account với Google
        user = await this.userRepository.linkOAuthProvider(
          existingUserByEmail.id,
          'google',
          providerId,
        );
      } else {
        // Tạo tài khoản mới cho Google user
        const created = await this.userRepository.createOAuthAccount({
          email,
          authProvider: 'google',
          providerId,
          fullName: name,
          avatarUrl: avatar,
        });
        user = created.user;
      }
    }

    // 3. Kiểm tra trạng thái tài khoản
    if (user.status === 'banned') {
      throw new ApplicationException({
        code: 'ACCOUNT_BANNED',
        messageKey: 'error.accountBanned',
        status: HttpStatus.FORBIDDEN,
      });
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      authProvider: user.authProvider,
      providerId: user.providerId,
    };
  }
}
