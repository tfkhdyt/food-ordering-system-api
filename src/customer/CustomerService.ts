import { hash, verify as verifyPwd } from 'argon2';
import { HTTPException } from 'hono/http-exception';
import { verify } from 'hono/jwt';
import { tryit } from 'radash';
import { ulid } from 'ulid';

import { env } from '@/env';
import { type CreateJwtOptions, createJwt } from '@/lib';
import { uploadFile } from '@/s3/S3Repository';
import { type JWTPayload } from '@/types';

import * as CustomerRepository from './CustomerRepository';
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

  await CustomerRepository.create({ ...newCustomer, id: Buffer.from(ulid()) });

  return { message: 'new customer has been created' };
}

export async function login(payload: CustomerLoginSchema) {
  const customer = await CustomerRepository.showByUsername(payload.username);

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

  const jwtOpts: CreateJwtOptions = {
    role: 'customer',
    sub: customer.id,
    username: customer.username,
  };

  const accessToken = await createJwt({
    ...jwtOpts,
    type: 'access',
  });
  const refreshToken = await createJwt({
    ...jwtOpts,
    type: 'refresh',
  });

  return {
    data: {
      access_token: accessToken,
      refresh_token: refreshToken,
    },
  };
}

export async function inspect(username: string) {
  const customer = await CustomerRepository.showByUsername(username);
  customer.profile_image &&= `${env.S3_ENDPOINT}/${env.S3_BUCKET}/${customer.profile_image}`;

  return { ...customer, password: undefined, role: 'customer' };
}

export async function refreshToken(token: string) {
  const [err, claims] = (await tryit(verify)(token, env.JWT_REFRESH_KEY)) as [
    Error | undefined,
    JWTPayload,
  ];
  if (err) {
    throw new HTTPException(401, {
      message: 'failed to verify refresh token',
    });
  }

  const customer = await CustomerRepository.showByUsername(claims.username);

  const jwtOpts: CreateJwtOptions = {
    role: 'customer',
    sub: customer.id,
    username: customer.username,
  };

  const accessToken = await createJwt({
    ...jwtOpts,
    type: 'access',
  });
  const refreshToken = await createJwt({
    ...jwtOpts,
    type: 'refresh',
  });

  return {
    data: {
      access_token: accessToken,
      refresh_token: refreshToken,
    },
  };
}

export async function setProfileImage(image: File, username: string) {
  const key = `profile-images/${username}.${image.name.split('.').pop()}`;
  await uploadFile(key, image);

  await CustomerRepository.updateProfileImage(username, key);

  return { message: 'profile picture updated successfully' };
}
