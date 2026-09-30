import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sign } from 'jsonwebtoken';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import {
  parseDurationToSeconds,
  TokenService,
} from './token.service';

describe('TokenService', () => {
  let tokenService: TokenService;
  let configService: ConfigService;

  const mockConfigValues: Record<string, any> = {
    'jwt.accessSecret': 'test-access-secret-key-12345678',
    'jwt.accessExpiresIn': '15m',
    'jwt.refreshSecret': 'test-refresh-secret-key-87654321',
    'jwt.refreshExpiresIn': '7d',
    'jwt.refreshCookieName': 'refresh_token',
    'app.environment': 'development',
  };

  beforeEach(() => {
    configService = {
      get: jest.fn((key: string) => mockConfigValues[key]),
    } as unknown as ConfigService;

    tokenService = new TokenService(configService);
  });

  describe('parseDurationToSeconds', () => {
    it('parses duration strings in seconds, minutes, hours, days', () => {
      expect(parseDurationToSeconds('30s')).toBe(30);
      expect(parseDurationToSeconds('15m')).toBe(900);
      expect(parseDurationToSeconds('2h')).toBe(7200);
      expect(parseDurationToSeconds('7d')).toBe(604800);
      expect(parseDurationToSeconds(1200)).toBe(1200);
      expect(parseDurationToSeconds('invalid')).toBe(900);
    });
  });

  describe('generateAccessToken and verifyAccessToken', () => {
    const userPayload: Omit<JwtPayload, 'type' | 'iat' | 'exp'> = {
      sub: 'user-uuid-123',
      email: 'user@example.com',
      role: 'user',
      status: 'active',
    };

    it('generates a valid access token containing user payload and type=access', async () => {
      const token = await tokenService.generateAccessToken(userPayload);
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);

      const decoded = await tokenService.verifyAccessToken(token);
      expect(decoded.sub).toBe(userPayload.sub);
      expect(decoded.email).toBe(userPayload.email);
      expect(decoded.role).toBe(userPayload.role);
      expect(decoded.status).toBe(userPayload.status);
      expect(decoded.type).toBe('access');
    });

    it('throws TOKEN_INVALID if a refresh token is verified as access token', async () => {
      const refreshToken = await tokenService.generateRefreshToken(userPayload);

      await expect(
        tokenService.verifyAccessToken(refreshToken),
      ).rejects.toThrow(ApplicationException);

      try {
        await tokenService.verifyAccessToken(refreshToken);
      } catch (error: any) {
        expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
        expect(error.getResponse()).toEqual(
          expect.objectContaining({
            code: 'TOKEN_INVALID',
            messageKey: 'error.tokenInvalid',
          }),
        );
      }
    });

    it('throws TOKEN_EXPIRED when access token has expired', async () => {
      const expiredToken = sign(
        { ...userPayload, type: 'access' },
        'test-access-secret-key-12345678',
        { expiresIn: -1 },
      );

      try {
        await tokenService.verifyAccessToken(expiredToken);
        throw new Error('Should have thrown');
      } catch (error: any) {
        expect(error).toBeInstanceOf(ApplicationException);
        expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
        expect(error.getResponse()).toEqual(
          expect.objectContaining({
            code: 'TOKEN_EXPIRED',
            messageKey: 'error.tokenExpired',
          }),
        );
      }
    });

    it('throws TOKEN_INVALID when access token has invalid signature', async () => {
      const invalidToken = sign(
        { ...userPayload, type: 'access' },
        'wrong-secret-key',
        { expiresIn: '15m' },
      );

      try {
        await tokenService.verifyAccessToken(invalidToken);
        throw new Error('Should have thrown');
      } catch (error: any) {
        expect(error).toBeInstanceOf(ApplicationException);
        expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
        expect(error.getResponse()).toEqual(
          expect.objectContaining({
            code: 'TOKEN_INVALID',
            messageKey: 'error.tokenInvalid',
          }),
        );
      }
    });
  });

  describe('generateRefreshToken and verifyRefreshToken', () => {
    const userPayload: Omit<JwtPayload, 'type' | 'iat' | 'exp'> = {
      sub: 'user-uuid-123',
      email: 'user@example.com',
      role: 'user',
      status: 'active',
      sessionId: 'session-uuid-456',
    };

    it('generates a valid refresh token containing session and type=refresh', async () => {
      const token = await tokenService.generateRefreshToken(userPayload);
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);

      const decoded = await tokenService.verifyRefreshToken(token);
      expect(decoded.sub).toBe(userPayload.sub);
      expect(decoded.email).toBe(userPayload.email);
      expect(decoded.role).toBe(userPayload.role);
      expect(decoded.status).toBe(userPayload.status);
      expect(decoded.sessionId).toBe(userPayload.sessionId);
      expect(decoded.type).toBe('refresh');
    });

    it('throws TOKEN_INVALID if an access token is verified as refresh token', async () => {
      const accessToken = await tokenService.generateAccessToken(userPayload);

      try {
        await tokenService.verifyRefreshToken(accessToken);
        throw new Error('Should have thrown');
      } catch (error: any) {
        expect(error).toBeInstanceOf(ApplicationException);
        expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
        expect(error.getResponse()).toEqual(
          expect.objectContaining({
            code: 'TOKEN_INVALID',
            messageKey: 'error.tokenInvalid',
          }),
        );
      }
    });

    it('throws TOKEN_EXPIRED when refresh token has expired', async () => {
      const expiredRefreshToken = sign(
        { ...userPayload, type: 'refresh' },
        'test-refresh-secret-key-87654321',
        { expiresIn: -1 },
      );

      try {
        await tokenService.verifyRefreshToken(expiredRefreshToken);
        throw new Error('Should have thrown');
      } catch (error: any) {
        expect(error).toBeInstanceOf(ApplicationException);
        expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
        expect(error.getResponse()).toEqual(
          expect.objectContaining({
            code: 'TOKEN_EXPIRED',
            messageKey: 'error.tokenExpired',
          }),
        );
      }
    });
  });

  describe('generateTokenPair', () => {
    it('returns accessToken, refreshToken, tokenType and expiresIn seconds', async () => {
      const userPayload = {
        sub: 'user-uuid-123',
        email: 'user@example.com',
        role: 'user',
        status: 'active',
      };

      const result = await tokenService.generateTokenPair(userPayload);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.tokenType).toBe('Bearer');
      expect(result.expiresIn).toBe(900); // 15m = 900s

      const decodedAccess = await tokenService.verifyAccessToken(
        result.accessToken,
      );
      const decodedRefresh = await tokenService.verifyRefreshToken(
        result.refreshToken,
      );

      expect(decodedAccess.type).toBe('access');
      expect(decodedRefresh.type).toBe('refresh');
    });
  });

  describe('cookie configuration and names', () => {
    it('returns development cookie options with secure=false, sameSite=lax', () => {
      const cookieOptions = tokenService.getRefreshTokenCookieOptions();

      expect(cookieOptions).toEqual({
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/api/auth',
        maxAge: 604800, // 7d = 604800s
      });
      expect(tokenService.getRefreshCookieName()).toBe('refresh_token');
    });

    it('returns production cookie options with secure=true, sameSite=strict', () => {
      const prodConfigService = {
        get: jest.fn((key: string) => {
          if (key === 'app.environment') return 'production';
          return mockConfigValues[key];
        }),
      } as unknown as ConfigService;

      const prodTokenService = new TokenService(prodConfigService);
      const cookieOptions = prodTokenService.getRefreshTokenCookieOptions();

      expect(cookieOptions.secure).toBe(true);
      expect(cookieOptions.sameSite).toBe('strict');
      expect(cookieOptions.httpOnly).toBe(true);
    });
  });
});
