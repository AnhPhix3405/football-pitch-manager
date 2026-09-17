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
