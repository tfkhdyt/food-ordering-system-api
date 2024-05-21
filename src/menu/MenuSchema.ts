import { z } from 'zod';

export const create = z.object({
  name: z.string().max(255),
  price: z.number(),
  type_id: z.string().ulid(),
  ingredients: z.string().nullable(),
  status: z.enum(['available', 'out_of_stock']).optional(),
});
export type Create = z.infer<typeof create>;
