import { HTTPException } from 'hono/http-exception';
import { type Insertable } from 'kysely';
import { type Users } from 'kysely-codegen';
import { tryit } from 'radash';

import db from '@/db';

export async function create(newUser: Insertable<Users>) {
  await verifyEmailAvailability(newUser.email);
  await verifyUsernameAvailability(newUser.username);

  const [err] = await tryit(() =>
    db.insertInto('users').values(newUser).executeTakeFirstOrThrow(),
  )();
  if (err) {
    throw new HTTPException(400, {
      message: 'failed to create new user',
      cause: err,
    });
  }
}

async function verifyEmailAvailability(email: string) {
  const [err, user] = await tryit(() =>
    db
      .selectFrom('users')
      .select('id')
      .where('email', '=', email)
      .executeTakeFirst(),
  )();
  if (err) {
    throw new HTTPException(500, {
      message: 'failed to verify email availability',
      cause: err,
    });
  }

  if (user) throw new HTTPException(400, { message: 'email has been used' });
}

async function verifyUsernameAvailability(username: string) {
  const [err, user] = await tryit(() =>
    db
      .selectFrom('users')
      .select('id')
      .where('username', '=', username)
      .executeTakeFirst(),
  )();
  if (err) {
    throw new HTTPException(500, {
      message: 'failed to verify username availability',
      cause: err,
    });
  }

  if (user) throw new HTTPException(400, { message: 'username has been used' });
}

export async function showByUsername(username: string) {
  const [err, user] = await tryit(() =>
    db
      .selectFrom('users')
      .selectAll()
      .where('username', '=', username)
      .executeTakeFirstOrThrow(),
  )();
  if (err) {
    throw new HTTPException(404, {
      message: `user with username ${username} is not found`,
      cause: err,
    });
  }

  return {
    ...user,
    id: user.id.toString(),
  };
}
