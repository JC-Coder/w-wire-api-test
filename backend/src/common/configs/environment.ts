import { config } from 'dotenv';
import * as Joi from 'joi';

config();

export interface IEnvironmentVariables {
  APP_NAME: string;
  APP_PORT: number;
  APP_ENV: string;
  APP_ENCRYPTION_KEY?: string;
  DB_URL: string;
  TEST_DB_URL?: string;
  JWT_SECRET: string;
  OPEN_EXCHANGE_APP_ID: string;
  OPEN_EXCHANGE_BASE_URL: string;
  REDIS_DB_URL: string;
}

const ENVIRONMENT_VARIABLES_SCHEMA = Joi.object<IEnvironmentVariables>({
  APP_NAME: Joi.string().required(),
  APP_PORT: Joi.number().default(3000),
  APP_ENV: Joi.string().valid('staging', 'production').default('staging'),
  APP_ENCRYPTION_KEY: Joi.string().optional(),
  DB_URL: Joi.string().required(),
  TEST_DB_URL: Joi.string().optional(),
  JWT_SECRET: Joi.string().required(),
  OPEN_EXCHANGE_APP_ID: Joi.string().required(),
  OPEN_EXCHANGE_BASE_URL: Joi.string()
    .optional()
    .default('https://openexchangerates.org/api'),
  REDIS_DB_URL: Joi.string().optional().default('redis://localhost:6379'),
});

// validate env variables
const result = ENVIRONMENT_VARIABLES_SCHEMA.validate(process.env, {
  allowUnknown: true,
  abortEarly: true,
});

if (result.error) {
  throw new Error(
    `Environment variables validation error: ${result?.error?.message}`,
  );
}

export const ENVIRONMENT_VARIABLES = result.value;

export const isStagingEnvironment = ['staging', 'dev', 'development'].includes(
  ENVIRONMENT_VARIABLES.APP_ENV,
);
export const isTestEnvironment = ['test'].includes(
  ENVIRONMENT_VARIABLES.APP_ENV,
);
