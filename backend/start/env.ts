/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  // Node
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.string(),

  // App
  APP_KEY: Env.schema.secret(),
  APP_URL: Env.schema.string({ format: 'url', tld: false }),

  // Session
  SESSION_DRIVER: Env.schema.enum(['cookie', 'memory', 'database'] as const),

  REDIS_HOST: Env.schema.string({ format: 'host' }),
  REDIS_PORT: Env.schema.number(),
  REDIS_PASSWORD: Env.schema.secret.optional(),

  /*
  |----------------------------------------------------------
  | Variables for configuring the limiter package
  |----------------------------------------------------------
  */
  LIMITER_STORE: Env.schema.enum(['redis', 'memory'] as const),

  // Database (PostgreSQL)
  DB_HOST: Env.schema.string({ format: 'host' }),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string(),

  // JWT auth
  JWT_ACCESS_SECRET: Env.schema.string(),
  JWT_ACCESS_EXPIRES_IN: Env.schema.string(),
  JWT_REFRESH_EXPIRES_IN_DAYS: Env.schema.number(),

  // File storage
  STORAGE_DISK_PATH: Env.schema.string(),
  MAX_UPLOAD_SIZE_MB: Env.schema.number(),

  // Exam proctoring
  EXAM_DEFAULT_MAX_VIOLATIONS: Env.schema.number(),

  // CORS
  CORS_ORIGIN: Env.schema.string(),
  COOKIE_SAME_SITE: Env.schema.enum(['lax', 'strict', 'none'] as const),

  // Seed defaults
  ADMIN_EMAIL: Env.schema.string.optional(),
  ADMIN_PASSWORD: Env.schema.string.optional(),
})
