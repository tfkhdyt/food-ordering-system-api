import { z } from 'zod';

export const registerSchema = z.object({
  full_name: z.string().max(100),
  contact: z.string().max(25).nullable(),
  email: z.string().email().max(100),
  username: z.string().max(25),
  password: z.string().min(8),
});
export type Register = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  username: z.string().max(25),
  password: z.string().min(8),
});
export type Login = z.infer<typeof loginSchema>;
