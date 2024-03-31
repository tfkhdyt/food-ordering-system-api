import { hash } from 'argon2';
import { HTTPException } from 'hono/http-exception';

import { type MessageResponse } from '../types';
import { createUser } from './UserRepository';
import { type CreateUser } from './UserSchema';

export async function register(newUser: CreateUser): Promise<MessageResponse> {
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
