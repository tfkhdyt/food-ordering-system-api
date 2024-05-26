import { z } from 'zod';

export const register = z.object({
  full_name: z.string().max(100),
  contact: z.string().max(25).nullable(),
  email: z.string().email().max(100),
  username: z.string().max(25),
  password: z.string().min(8),
});
export type Register = z.infer<typeof register>;

export const login = z.object({
  username: z.string().max(25),
  password: z.string().min(8),
});
export type Login = z.infer<typeof login>;

export const refreshToken = z.object({
  refresh_token: z.string(),
});

export const update = z.object({
  full_name: z.string().max(100).optional(),
  contact: z.string().max(25).nullish(),
  email: z.string().email().max(100).optional(),
  username: z.string().max(25).optional(),
});
export type Update = z.infer<typeof update>;
