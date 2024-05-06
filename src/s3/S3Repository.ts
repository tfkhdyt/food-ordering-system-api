import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { HTTPException } from 'hono/http-exception';
import { tryit } from 'radash';

import { env } from '@/env';

const s3Client = new S3Client({
  region: 'auto',
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY,
    secretAccessKey: env.S3_SECRET_KEY,
  },
  endpoint: env.S3_ENDPOINT,
});

export async function uploadFile(key: string, file: File) {
  const [err] = await tryit(async () =>
    s3Client.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: key,
        Body: Buffer.from(await file.arrayBuffer()),
        ACL: 'public-read',
        ContentType: file.type,
      }),
    ),
  )();
  if (err) {
    throw new HTTPException(400, {
      message: 'failed to upload file to s3',
      cause: err,
    });
  }
}
