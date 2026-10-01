import { validateEnvironment } from './environment.validation';

describe('validateEnvironment', () => {
  it('applies defaults for optional application settings', () => {
    expect(validateEnvironment({})).toMatchObject({
      NODE_ENV: 'development',
      PORT: 3000,
      HOST: '0.0.0.0',
      APP_NAME: 'football-pitch-manager',
      API_PREFIX: '',
      CORS_ORIGIN: '',
      GOOGLE_CLIENT_ID: '',
      JWT_ACCESS_SECRET: 'default-jwt-access-secret-key-change-in-prod',
      JWT_ACCESS_EXPIRES_IN: '15m',
      JWT_REFRESH_SECRET: 'default-jwt-refresh-secret-key-change-in-prod',
      JWT_REFRESH_EXPIRES_IN: '7d',
      JWT_REFRESH_COOKIE_NAME: 'refresh_token',
      LOG_LEVEL: 'log',
    });
  });

  it('rejects a port below the allowed range', () => {
    expect(() => validateEnvironment({ PORT: '0' })).toThrow(
      'Environment validation failed',
    );
  });

  it('rejects a non-numeric port', () => {
    expect(() => validateEnvironment({ PORT: 'not-a-port' })).toThrow(
      'Environment validation failed',
    );
  });

  it('rejects an unsupported environment', () => {
    expect(() => validateEnvironment({ NODE_ENV: 'staging' })).toThrow(
      'Environment validation failed',
    );
  });
});
