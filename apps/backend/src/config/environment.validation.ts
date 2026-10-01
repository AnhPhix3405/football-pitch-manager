import * as Joi from 'joi';

export const environmentValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  PORT: Joi.number().integer().min(1).max(65535).default(3000),
  HOST: Joi.string().hostname().default('0.0.0.0'),
  APP_NAME: Joi.string().trim().min(1).default('football-pitch-manager'),
  API_PREFIX: Joi.string().allow('').default(''),
  CORS_ORIGIN: Joi.string().allow('').default(''),
  GOOGLE_CLIENT_ID: Joi.string().allow('').default(''),
  JWT_ACCESS_SECRET: Joi.string().default('default-jwt-access-secret-key-change-in-prod'),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().default('default-jwt-refresh-secret-key-change-in-prod'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  JWT_REFRESH_COOKIE_NAME: Joi.string().default('refresh_token'),
  LOG_LEVEL: Joi.string()
    .valid('fatal', 'error', 'warn', 'log', 'debug', 'verbose')
    .default('log'),
}).unknown(true);

export const validateEnvironment = (config: Record<string, unknown>) => {
  const validationResult = environmentValidationSchema.validate(config, {
    abortEarly: false,
    convert: true,
  }) as Joi.ValidationResult<Record<string, unknown>>;

  if (validationResult.error) {
    throw new Error(
      `Environment validation failed: ${validationResult.error.message}`,
    );
  }

  return validationResult.value;
};
