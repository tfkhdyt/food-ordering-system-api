import { hash, verify as verifyPwd } from 'argon2';
import { HTTPException } from 'hono/http-exception';
import { sign, verify } from 'hono/jwt';
import { tryit } from 'radash';

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
  const [err, hashedPwd] = await tryit(hash)(newCustomer.password);
  if (err) {
    throw new HTTPException(500, {
      message: 'failed to hash password',
      cause: err,
    });
  }
  newCustomer.password = hashedPwd;

  await createCustomer(newCustomer);

  return { message: 'new customer has been created' };
}

export async function customerLogin(payload: CustomerLoginSchema) {
  const customer = await findCustomerByUsername(payload.username);

  const [err, isPwdValid] = await tryit(verifyPwd)(
    customer.password,
    payload.password,
  );
  if (err) {
    throw new HTTPException(500, {
      message: 'failed to verify password',
      cause: err,
    });
  }

  if (!isPwdValid) {
    throw new HTTPException(401, { message: 'password is invalid' });
  }

  const [errAccess, accessToken] = await tryit(sign)(
    {
      sub: customer.id,
      username: customer.username,
      role: 'customer',
      exp: Math.floor(Date.now() / 1000) + 5 * 60,
      iat: Date.now() / 1000,
      nbf: Date.now() / 1000,
    },
    env.JWT_ACCESS_KEY,
  );
  if (errAccess) {
    throw new HTTPException(500, { message: 'failed to sign access token' });
  }

  const [errRefresh, refreshToken] = await tryit(sign)(
    {
      sub: customer.id,
      username: customer.username,
      role: 'customer',
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      iat: Date.now() / 1000,
      nbf: Date.now() / 1000,
    },
    env.JWT_REFRESH_KEY,
  );
  if (errRefresh) {
    throw new HTTPException(500, { message: 'failed to sign refresh token' });
  }

  return {
    data: {
      access_token: accessToken,
      refresh_token: refreshToken,
    },
  };
}

export async function customerInspect(username: string) {
  const customer = await findCustomerByUsername(username);
  customer.profile_image &&= `${env.S3_ENDPOINT}/${env.S3_BUCKET}/${customer.profile_image}`;

  return { ...customer, password: undefined, role: 'customer' };
}

export async function customerRefreshToken(token: string) {
  const [err, claims] = (await tryit(verify)(token, env.JWT_REFRESH_KEY)) as [
    Error | undefined,
    JWTPayload,
  ];
  if (err) {
    throw new HTTPException(401, {
      message: 'failed to verify refresh token',
    });
  }

  const customer = await findCustomerByUsername(claims.username);

  const [errAccess, accessToken] = await tryit(sign)(
    {
      sub: customer.id,
      username: customer.username,
      role: 'customer',
      exp: Math.floor(Date.now() / 1000) + 5 * 60,
      iat: Date.now() / 1000,
      nbf: Date.now() / 1000,
    },
    env.JWT_ACCESS_KEY,
  );
  if (errAccess) {
    throw new HTTPException(500, {
      message: 'failed to sign access token',
      cause: errAccess,
    });
  }

  const [errRefresh, refreshToken] = await tryit(sign)(
    {
      sub: customer.id,
      username: customer.username,
      role: 'customer',
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      iat: Date.now() / 1000,
      nbf: Date.now() / 1000,
    },
    env.JWT_REFRESH_KEY,
  );
  if (errRefresh) {
    throw new HTTPException(500, {
      message: 'failed to sign refresh token',
      cause: errRefresh,
    });
  }

  return {
    data: {
      access_token: accessToken,
      refresh_token: refreshToken,
    },
  };
}

export async function patchCustomerProfileImage(image: File, username: string) {
  const key = `profile-images/${username}.${image.name.split('.').pop()}`;
  await uploadFile(key, image);

  await updateCustomerProfileImage(username, key);

  return { message: 'profile picture updated successfully' };
}
