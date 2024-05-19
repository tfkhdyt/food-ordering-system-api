import { z } from 'zod';

export const create = z.object({
  name: z.string().max(100),
  description: z.string().nullable(),
});
export type Create = z.infer<typeof create>;

export const update = z.object({
  name: z.string().max(100).optional(),
  description: z.string().optional(),
});
export type Update = z.infer<typeof update>;

export const idParam = z.object({
  id: z.coerce.string().ulid(),
});
