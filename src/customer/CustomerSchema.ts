import { z } from 'zod';

export const customerRegisterSchema = z.object({
  first_name: z.string().max(25),
  middle_name: z.string().max(25).nullable(),
  last_name: z.string().max(25).nullable(),
  email: z.string().max(50).email(),
  phone_number: z.string().max(15),
  address: z.string(),
  username: z.string().max(25),
  password: z.string().min(8),
});
export type CustomerRegisterSchema = z.infer<typeof customerRegisterSchema>;
