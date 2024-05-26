import { hash, verify as verifyArgon } from 'argon2';
import { HTTPException } from 'hono/http-exception';
import { verify } from 'hono/jwt';
import { tryit } from 'radash';
import { ulid } from 'ulid';

import { env } from '@/env';
import { type CreateJwtOptions, createJwt } from '@/lib';
import { type JWTPayload } from '@/types';

import * as UserRepository from './UserRepository';
import type * as UserSchema from './UserSchema';

export async function register(newUser: UserSchema.Register) {
  const [err, hashedPwd] = await tryit(hash)(newUser.password);
  if (err) {
    throw new HTTPException(500, {
      message: 'failed to hash password',
      cause: err,
    });
  }

  newUser.password = hashedPwd;

  await UserRepository.create({
    ...newUser,
    id: Buffer.from(ulid()),
  });

  return { message: 'new user has been created' };
}

export async function login(credentials: UserSchema.Login) {
  const user = await UserRepository.showByUsername(credentials.username);

  const [err, isPwdValid] = await tryit(verifyArgon)(
    user.password,
    credentials.password,
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
    role: 'user',
    sub: user.id,
    username: user.username,
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
  const user = await UserRepository.showByUsername(username);

  return { ...user, password: undefined, role: 'user' };
}

export async function refreshToken(token: string) {
  const [err, jwtPayload] = (await tryit(verify)(
    token,
    env.JWT_REFRESH_KEY,
  )) as [Error | undefined, JWTPayload];
  if (err) {
    throw new HTTPException(401, {
      message: 'failed to verify refresh token',
    });
  }

  const user = await UserRepository.showByUsername(jwtPayload.username);

  const jwtOpts: CreateJwtOptions = {
    role: 'user',
    sub: user.id,
    username: user.username,
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

export async function update(id: string, newUser: UserSchema.Update) {
  await UserRepository.update(id, newUser);

  return { message: 'user has been updated' };
}
