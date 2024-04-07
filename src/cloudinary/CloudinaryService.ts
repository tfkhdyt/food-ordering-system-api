import { v2 as cloudinary } from 'cloudinary';
import { HTTPException } from 'hono/http-exception';

import { env } from '@/env';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export async function uploadProfileImage(file: File, fileName: string) {
  try {
    const res = await cloudinary.uploader.upload(
      `data:${file.type};base64,${Buffer.from(await file.arrayBuffer()).toString('base64')}`,
      {
        public_id: fileName,
        overwrite: true,
        folder: '/food-ordering-system/profile-images',
      },
    );
    return res.public_id;
  } catch (error) {
    throw new HTTPException(400, {
      message: 'failed to upload profile image',
      cause: error,
    });
  }
}

export async function getProfileImageUrl(fileId: string) {
  try {
    const res = (await cloudinary.api.resource(fileId)) as { url: string };

    return res.url;
  } catch (error) {
    throw new HTTPException(400, {
      message: 'failed to get profile image url',
      cause: error,
    });
  }
}
