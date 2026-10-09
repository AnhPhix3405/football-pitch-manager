import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { UserRepository } from '~/repositories/user.repository';
import { AuthenticatedUserDto } from '../dto/login-response.dto';
import { TokenPair } from '../interfaces/jwt-payload.interface';
import { AuthSessionService } from './auth-session.service';
import { parseDurationToSeconds, TokenService } from './token.service';

export interface RefreshTokenExecutionResult {
  tokens: TokenPair;
  user: AuthenticatedUserDto;
}

@Injectable()
export class RefreshTokenService {
  private readonly refreshExpiresIn: string;

  constructor(
    private readonly tokenService: TokenService,
    private readonly authSessionService: AuthSessionService,
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {
    this.refreshExpiresIn =
      this.configService.get<string>('jwt.refreshExpiresIn') ?? '7d';
  }

  async execute(
    refreshToken: string | null | undefined,
  ): Promise<RefreshTokenExecutionResult> {
    if (!refreshToken || typeof refreshToken !== 'string' || refreshToken.trim().length === 0) {
      throw new ApplicationException({
        code: 'REFRESH_TOKEN_MISSING',
        messageKey: 'error.refreshTokenMissing',
        status: HttpStatus.UNAUTHORIZED,
      });
    }

    const payload = await this.tokenService.verifyRefreshToken(refreshToken.trim());

    const user = await this.userRepository.findById(payload.sub);
    if (!user) {
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

    const ttlSeconds = parseDurationToSeconds(this.refreshExpiresIn);

    // If session id is in payload, rotate the existing session; otherwise create session
    let sessionId = payload.sessionId;
    const newTokens = await this.tokenService.generateTokenPair({
      sub: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      sessionId,
    });

    if (sessionId) {
      await this.authSessionService.rotateSession(
        sessionId,
        refreshToken.trim(),
        newTokens.refreshToken,
        ttlSeconds,
      );
    } else {
      const createdSession = await this.authSessionService.createSession({
        userId: user.id,
        refreshToken: newTokens.refreshToken,
        ttlSeconds,
      });
      sessionId = createdSession.id;
    }

    return {
      tokens: newTokens,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        authProvider: user.authProvider,
      },
    };
  }
}
