import { HTTPException } from 'hono/http-exception';
import { type Insertable } from 'kysely';
import { type Customers } from 'kysely-codegen';
import { tryit } from 'radash';

export async function create(newCustomer: Insertable<Customers>) {
  await verifyEmailAvailability(newCustomer.email);
  await verifyPhoneAvailability(newCustomer.phone_number);
  await verifyUsernameAvailability(newCustomer.username);

  const [err] = await tryit(async () =>
    db.insertInto('customers').values(newCustomer).executeTakeFirstOrThrow(),
  )();
  if (err) {
    throw new HTTPException(400, {
      message: 'failed to create new customer',
      cause: err,
    });
  }
}

async function verifyEmailAvailability(email: string) {
  const [err, customer] = await tryit(async () =>
    db
      .selectFrom('customers')
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

  if (customer)
    throw new HTTPException(400, { message: 'email has been used' });
}

async function verifyPhoneAvailability(phone: string) {
  const [err, customer] = await tryit(async () =>
    db
      .selectFrom('customers')
      .select('id')
      .where('phone_number', '=', phone)
      .executeTakeFirst(),
  )();
  if (err) {
    throw new HTTPException(500, {
      message: 'failed to verify phone number availability',
      cause: err,
    });
  }

  if (customer)
    throw new HTTPException(400, { message: 'phone number has been used' });
}

async function verifyUsernameAvailability(username: string) {
  const [err, customer] = await tryit(async () =>
    db
      .selectFrom('customers')
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

  if (customer)
    throw new HTTPException(400, { message: 'username has been used' });
}

export async function showByUsername(username: string) {
  const [err, customer] = await tryit(async () =>
    db
      .selectFrom('customers')
      .selectAll()
      .where('username', '=', username)
      .executeTakeFirstOrThrow(),
  )();
  if (err) {
    throw new HTTPException(404, {
      message: `customer with username ${username} is not found`,
      cause: err,
    });
  }

  return { ...customer, id: customer.id.toString() };
}

export async function updateProfileImage(username: string, fileId: string) {
  const [err] = await tryit(async () =>
    db
      .updateTable('customers')
      .set({ profile_image: fileId, updated_at: new Date() })
      .where('username', '=', username)
      .executeTakeFirstOrThrow(),
  )();
  if (err) {
    throw new HTTPException(400, {
      message: 'failed to set profile picture',
      cause: err,
    });
  }
}
