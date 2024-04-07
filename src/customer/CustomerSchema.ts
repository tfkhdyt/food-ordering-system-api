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

export const customerLoginSchema = z.object({
  username: z.string().max(25),
  password: z.string().min(8),
});
export type CustomerLoginSchema = z.infer<typeof customerLoginSchema>;

export const setProfileImage = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size !== 0, 'file is empty')
    .refine((file) => file.type.startsWith('image/'), 'file should be an image')
    .refine((file) => file.size < 1_000_000, 'file should be less than 1MB'),
});
