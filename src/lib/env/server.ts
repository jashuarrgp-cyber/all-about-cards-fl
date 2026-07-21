import 'server-only';
import { z } from 'zod';
export const serverEnvSchema = z.object({
  APP_URL: z.string().url(),
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  AUTH_GITHUB_ID: z.string().optional().default(''),
  AUTH_GITHUB_SECRET: z.string().optional().default(''),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  TEST_ENV: z.enum(['true', 'false']).default('false'),
  // Optional: raises the Pokémon TCG API rate limit. Live pricing search
  // works without it at the API's default public rate limit.
  POKEMON_TCG_API_KEY: z.string().optional().default(''),
});
export const serverEnv = serverEnvSchema.parse(process.env);
