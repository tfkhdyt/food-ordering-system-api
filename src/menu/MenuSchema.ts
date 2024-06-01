import { z } from 'zod';

export const create = z.object({
  name: z.string().max(255),
  price: z.number(),
  type_id: z.string().ulid(),
  ingredients: z.string().nullable(),
  status: z.enum(['available', 'out_of_stock']).optional(),
});
export type Create = z.infer<typeof create>;

export const update = z.object({
  name: z.string().max(255).optional(),
  price: z.number().optional(),
  type_id: z.string().ulid().optional(),
  ingredients: z.string().optional(),
  status: z.enum(['available', 'out_of_stock']).optional(),
});
export type Update = z.infer<typeof update>;
