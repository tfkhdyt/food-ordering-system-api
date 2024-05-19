import { z } from 'zod';

export const addMenuTypeSchema = z.object({
  name: z.string().max(100),
  description: z.string().nullable(),
});
export type AddMenuTypeSchema = z.infer<typeof addMenuTypeSchema>;
