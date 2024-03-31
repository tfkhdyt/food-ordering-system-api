import { HTTPException } from 'hono/http-exception';
import { type Insertable } from 'kysely';
import { type Users } from 'kysely-codegen';

import db from '../db';

export async function createUser(newUser: Insertable<Users>): Promise<void> {
  try {
    await verifyEmailAvailability(newUser.email);
    await verifyUsernameAvailability(newUser.username);

    await db.insertInto('users').values(newUser).executeTakeFirstOrThrow();
  } catch (error) {
    throw new HTTPException(400, {
      message: 'failed to create new user',
      cause: error,
    });
  }
}

async function verifyEmailAvailability(email: string): Promise<void> {
  try {
    const user = await db
      .selectFrom('users')
      .select('id')
      .where('email', '=', email)
      .executeTakeFirst();

    if (user) throw new HTTPException(400, { message: 'email has been used' });
  } catch (error) {
    if (error instanceof HTTPException) throw error;

    throw new HTTPException(500, {
      message: 'failed to verify email availability',
      cause: error,
    });
  }
}

async function verifyUsernameAvailability(username: string): Promise<void> {
  try {
    const user = await db
      .selectFrom('users')
      .select('id')
      .where('username', '=', username)
      .executeTakeFirst();

    if (user)
      throw new HTTPException(400, { message: 'username has been used' });
  } catch (error) {
    if (error instanceof HTTPException) throw error;

    throw new HTTPException(500, {
      message: 'failed to verify username availability',
      cause: error,
    });
  }
}
