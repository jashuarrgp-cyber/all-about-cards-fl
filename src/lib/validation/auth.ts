import { z } from 'zod';
export const signInSchema = z.object({
  callbackUrl: z.string().url().optional(),
});
export const ownerBootstrapSchema = z.object({
  email: z.string().email(),
  confirmation: z.literal('PROMOTE_INITIAL_OWNER'),
});
