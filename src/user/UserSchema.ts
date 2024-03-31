import { z } from 'zod';

export const createUserSchema = z.object({
  full_name: z.string().max(100),
  contact: z.string().max(25).nullable(),
  email: z.string().email().max(100),
  username: z.string().max(25),
  password: z.string().min(8),
});
export type CreateUser = z.infer<typeof createUserSchema>;
