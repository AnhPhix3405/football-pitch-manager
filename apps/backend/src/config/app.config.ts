import { registerAs } from '@nestjs/config';

export const normalizeApiPrefix = (value: string): string =>
  value.replace(/^\/+|\/+$/g, '');

export const appConfig = registerAs('app', () => ({
  name: process.env.APP_NAME ?? 'football-pitch-manager',
  environment: process.env.NODE_ENV ?? 'development',
  host: process.env.HOST ?? '0.0.0.0',
  port: Number(process.env.PORT ?? 3000),
  apiPrefix: normalizeApiPrefix(process.env.API_PREFIX ?? ''),
  corsOrigin: process.env.CORS_ORIGIN ?? '',
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? '',
  logLevel: process.env.LOG_LEVEL ?? 'log',
}));
