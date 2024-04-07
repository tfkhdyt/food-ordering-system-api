import { hash, verify as verifyPwd } from 'argon2';
import { HTTPException } from 'hono/http-exception';
import { sign, verify } from 'hono/jwt';

import { env } from '@/env';
import { uploadFile } from '@/s3/S3Repository';
import { type JWTPayload } from '@/types';

import {
  createCustomer,
  findCustomerByUsername,
  updateCustomerProfileImage,
} from './CustomerRepository';
import {
  type CustomerLoginSchema,
  type CustomerRegisterSchema,
} from './CustomerSchema';

export async function register(newCustomer: CustomerRegisterSchema) {
  try {
    newCustomer.password = await hash(newCustomer.password);
    await createCustomer(newCustomer);

    return { statusCode: 201, message: 'new customer has been created' };
  } catch (error) {
    if (error instanceof HTTPException) throw error;

    throw new HTTPException(500, {
      message: 'an error is occured',
      cause: error,
    });
  }
}

export async function customerLogin(payload: CustomerLoginSchema) {
  try {
    const customer = await findCustomerByUsername(payload.username);
    if (!(await verifyPwd(customer.password, payload.password))) {
      throw new HTTPException(401, { message: 'password is invalid' });
    }

    const accessToken = await sign(
      {
        sub: customer.id,
        username: customer.username,
        exp: Math.floor(Date.now() / 1000) + 5 * 60,
        iat: Date.now() / 1000,
        nbf: Date.now() / 1000,
      },
      env.JWT_ACCESS_KEY,
    );
    const refreshToken = await sign(
      {
        sub: customer.id,
        username: customer.username,
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
        iat: Date.now() / 1000,
        nbf: Date.now() / 1000,
      },
      env.JWT_REFRESH_KEY,
    );

    return {
      statusCode: 201,
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    };
  } catch (error) {
    if (error instanceof HTTPException) throw error;

    throw new HTTPException(500, {
      message: 'an error is occured',
      cause: error,
    });
  }
}

export async function customerInspect(username: string) {
  const customer = await findCustomerByUsername(username);
  customer.profile_image &&= `${env.S3_ENDPOINT}/${env.S3_BUCKET}/${customer.profile_image}`;

  return { ...customer, password: undefined };
}

export async function customerRefreshToken(token: string) {
  try {
    const claims = (await verify(token, env.JWT_REFRESH_KEY)) as JWTPayload;
    const customer = await findCustomerByUsername(claims.username);

    const accessToken = await sign(
      {
        sub: customer.id,
        username: customer.username,
        exp: Math.floor(Date.now() / 1000) + 5 * 60,
        iat: Date.now() / 1000,
        nbf: Date.now() / 1000,
      },
      env.JWT_ACCESS_KEY,
    );
    const refreshToken = await sign(
      {
        sub: customer.id,
        username: customer.username,
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
        iat: Date.now() / 1000,
        nbf: Date.now() / 1000,
      },
      env.JWT_REFRESH_KEY,
    );

    return {
      statusCode: 201,
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    };
  } catch (error) {
    if (error instanceof HTTPException) throw error;

    throw new HTTPException(500, {
      message: 'an error is occured',
      cause: error,
    });
  }
}

export async function patchCustomerProfileImage(image: File, username: string) {
  const key = `profile-images/${username}.${image.name.split('.').pop()}`;
  await uploadFile(key, image);

  await updateCustomerProfileImage(username, key);

  return { message: 'profile picture updated successfully' };
}
