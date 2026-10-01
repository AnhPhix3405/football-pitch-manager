import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  JsonWebTokenError,
  SignOptions,
  TokenExpiredError,
  sign,
  verify,
} from 'jsonwebtoken';
import { ApplicationException } from '~/common/exceptions/application.exception';
import {
  JwtPayload,
  RefreshCookieOptions,
  TokenPair,
} from '../interfaces/jwt-payload.interface';

export const parseDurationToSeconds = (duration: string | number): number => {
  if (typeof duration === 'number') {
    return duration;
  }
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) {
    const parsed = parseInt(duration, 10);
    return isNaN(parsed) ? 900 : parsed;
  }
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 3600;
    case 'd':
      return value * 86400;
    default:
      return value;
  }
};

@Injectable()
export class TokenService {
  private readonly accessSecret: string;
  private readonly accessExpiresIn: string;
  private readonly refreshSecret: string;
  private readonly refreshExpiresIn: string;
  private readonly refreshCookieName: string;
  private readonly isProduction: boolean;

  constructor(private readonly configService: ConfigService) {
    this.accessSecret =
      this.configService.get<string>('jwt.accessSecret') ??
      'default-jwt-access-secret-key-change-in-prod';
    this.accessExpiresIn =
      this.configService.get<string>('jwt.accessExpiresIn') ?? '15m';
    this.refreshSecret =
      this.configService.get<string>('jwt.refreshSecret') ??
      'default-jwt-refresh-secret-key-change-in-prod';
    this.refreshExpiresIn =
      this.configService.get<string>('jwt.refreshExpiresIn') ?? '7d';
    this.refreshCookieName =
      this.configService.get<string>('jwt.refreshCookieName') ??
      'refresh_token';
    this.isProduction =
      this.configService.get<string>('app.environment') === 'production';
  }

  async generateAccessToken(
    payload: Omit<JwtPayload, 'type' | 'iat' | 'exp'>,
  ): Promise<string> {
    const tokenPayload: JwtPayload = {
      ...payload,
      type: 'access',
    };
    return new Promise((resolve, reject) => {
      sign(
        tokenPayload,
        this.accessSecret,
        { expiresIn: this.accessExpiresIn as any },
        (err, token) => {
          if (err || !token) return reject(err);
          resolve(token);
        },
      );
    });
  }

  async generateRefreshToken(
    payload: Omit<JwtPayload, 'type' | 'iat' | 'exp'>,
  ): Promise<string> {
    const tokenPayload: JwtPayload = {
      ...payload,
      type: 'refresh',
    };
    return new Promise((resolve, reject) => {
      sign(
        tokenPayload,
        this.refreshSecret,
        { expiresIn: this.refreshExpiresIn as any },
        (err, token) => {
          if (err || !token) return reject(err);
          resolve(token);
        },
      );
    });
  }

  async generateTokenPair(
    payload: Omit<JwtPayload, 'type' | 'iat' | 'exp'>,
  ): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload),
    ]);

    const expiresIn = parseDurationToSeconds(this.accessExpiresIn);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn,
    };
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    return new Promise((resolve, reject) => {
      verify(token, this.accessSecret, (err, decoded) => {
        if (err) {
          if (err instanceof TokenExpiredError) {
            return reject(
              new ApplicationException({
                code: 'TOKEN_EXPIRED',
                messageKey: 'error.tokenExpired',
                status: HttpStatus.UNAUTHORIZED,
              }),
            );
          }
          return reject(
            new ApplicationException({
              code: 'TOKEN_INVALID',
              messageKey: 'error.tokenInvalid',
              status: HttpStatus.UNAUTHORIZED,
            }),
          );
        }

        const payload = decoded as JwtPayload;
        if (payload.type !== 'access') {
          return reject(
            new ApplicationException({
              code: 'TOKEN_INVALID',
              messageKey: 'error.tokenInvalid',
              status: HttpStatus.UNAUTHORIZED,
            }),
          );
        }

        resolve(payload);
      });
    });
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    return new Promise((resolve, reject) => {
      verify(token, this.refreshSecret, (err, decoded) => {
        if (err) {
          if (err instanceof TokenExpiredError) {
            return reject(
              new ApplicationException({
                code: 'TOKEN_EXPIRED',
                messageKey: 'error.tokenExpired',
                status: HttpStatus.UNAUTHORIZED,
              }),
            );
          }
          return reject(
            new ApplicationException({
              code: 'TOKEN_INVALID',
              messageKey: 'error.tokenInvalid',
              status: HttpStatus.UNAUTHORIZED,
            }),
          );
        }

        const payload = decoded as JwtPayload;
        if (payload.type !== 'refresh') {
          return reject(
            new ApplicationException({
              code: 'TOKEN_INVALID',
              messageKey: 'error.tokenInvalid',
              status: HttpStatus.UNAUTHORIZED,
            }),
          );
        }

        resolve(payload);
      });
    });
  }

  getRefreshTokenCookieOptions(): RefreshCookieOptions {
    const maxAge = parseDurationToSeconds(this.refreshExpiresIn);
    return {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: this.isProduction ? 'strict' : 'lax',
      path: '/api/auth',
      maxAge,
    };
  }

  getRefreshCookieName(): string {
    return this.refreshCookieName;
  }
}
