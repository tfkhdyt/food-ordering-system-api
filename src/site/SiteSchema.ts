import { z } from 'zod';

export const setSiteInfoSchema = z.object({
  address: z.string(),
  contact_info: z.string().max(50),
  description: z.string().nullable(),
  name: z.string().max(50),
});
export type SiteInformation = z.infer<typeof setSiteInfoSchema>;
