import { z } from 'zod';
export const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().optional(),
});
export const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
});
