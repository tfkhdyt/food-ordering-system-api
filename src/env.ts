import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    PORT: z.coerce.number().positive().optional(),
    JWT_ACCESS_KEY: z.string(),
    JWT_REFRESH_KEY: z.string(),
    CLOUDINARY_CLOUD_NAME: z.string(),
    CLOUDINARY_API_KEY: z.string(),
    CLOUDINARY_API_SECRET: z.string(),
    S3_ENDPOINT: z.string().url(),
    S3_BUCKET: z.string(),
    S3_ACCESS_KEY: z.string(),
    S3_SECRET_KEY: z.string(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
