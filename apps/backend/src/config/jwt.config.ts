import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  accessSecret:
    process.env.JWT_ACCESS_SECRET ??
    'default-jwt-access-secret-key-change-in-prod',
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
  refreshSecret:
    process.env.JWT_REFRESH_SECRET ??
    'default-jwt-refresh-secret-key-change-in-prod',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  refreshCookieName: process.env.JWT_REFRESH_COOKIE_NAME ?? 'refresh_token',
}));
