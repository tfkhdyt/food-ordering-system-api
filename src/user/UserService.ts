import { hash, verify } from 'argon2';
import { HTTPException } from 'hono/http-exception';
import { sign } from 'hono/jwt';

import { env } from '../env';
import { type MessageResponse } from '../types';
import { createUser, findUserByUsername } from './UserRepository';
import { type Login, type Register } from './UserSchema';

type JWTResponse = {
  statusCode: number;
  data: {
    access_token: string;
    refresh_token: string;
  };
};

export async function register(newUser: Register): Promise<MessageResponse> {
  try {
    newUser.password = await hash(newUser.password);

    await createUser(newUser);

    return { statusCode: 201, message: 'new user has been created' };
  } catch (error) {
    if (error instanceof HTTPException) throw error;

    throw new HTTPException(500, {
      message: 'an error is occured',
      cause: error,
    });
  }
}

export async function login(credentials: Login): Promise<JWTResponse> {
  try {
    const user = await findUserByUsername(credentials.username);

    if (!(await verify(user.password, credentials.password))) {
      throw new HTTPException(401, { message: 'password is invalid' });
    }

    const accessToken = await sign(
      {
        sub: user.id,
        username: user.username,
        exp: Math.floor(Date.now() / 1000) + 5 * 60,
      },
      env.JWT_ACCESS_KEY,
    );
    const refreshToken = await sign(
      {
        sub: user.id,
        username: user.username,
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
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
