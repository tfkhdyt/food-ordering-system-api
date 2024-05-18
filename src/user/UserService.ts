import { hash, verify as verifyArgon } from 'argon2';
import { HTTPException } from 'hono/http-exception';
import { sign, verify } from 'hono/jwt';
import { tryit } from 'radash';
import { ulid } from 'ulid';

import { env } from '@/env';
import { type JWTPayload } from '@/types';

import * as UserRepository from './UserRepository';
import { type Login, type RegisterSchema } from './UserSchema';

export async function register(newUser: RegisterSchema) {
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
    id: Buffer.from(ulid(), 'utf8'),
  });

  return { message: 'new user has been created' };
}

export async function login(credentials: Login) {
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

  const [errAccess, accessToken] = await tryit(sign)(
    {
      sub: user.id,
      username: user.username,
      role: 'user',
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
      sub: user.id,
      username: user.username,
      role: 'user',
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

  const [errAccess, accessToken] = await tryit(sign)(
    {
      sub: user.id,
      username: user.username,
      role: 'user',
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
      sub: user.id,
      username: user.username,
      role: 'user',
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
