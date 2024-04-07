import { HTTPException } from 'hono/http-exception';
import { type Insertable } from 'kysely';
import { type Customers } from 'kysely-codegen';

export async function createCustomer(newCustomer: Insertable<Customers>) {
  try {
    await verifyEmailAvailability(newCustomer.email);
    await verifyPhoneAvailability(newCustomer.phone_number);
    await verifyUsernameAvailability(newCustomer.username);

    await db
      .insertInto('customers')
      .values(newCustomer)
      .executeTakeFirstOrThrow();
  } catch (error) {
    if (error instanceof HTTPException) throw error;

    throw new HTTPException(400, {
      message: 'failed to create new customer',
      cause: error,
    });
  }
}

async function verifyEmailAvailability(email: string) {
  try {
    const customer = await db
      .selectFrom('customers')
      .select('id')
      .where('email', '=', email)
      .executeTakeFirst();
    if (customer)
      throw new HTTPException(400, { message: 'email has been used' });
  } catch (error) {
    if (error instanceof HTTPException) throw error;

    throw new HTTPException(500, {
      message: 'failed to verify email availability',
      cause: error,
    });
  }
}

async function verifyPhoneAvailability(phone: string) {
  try {
    const customer = await db
      .selectFrom('customers')
      .select('id')
      .where('phone_number', '=', phone)
      .executeTakeFirst();
    if (customer)
      throw new HTTPException(400, { message: 'phone number has been used' });
  } catch (error) {
    if (error instanceof HTTPException) throw error;

    throw new HTTPException(500, {
      message: 'failed to verify phone number availability',
      cause: error,
    });
  }
}

async function verifyUsernameAvailability(username: string) {
  try {
    const customer = await db
      .selectFrom('customers')
      .select('id')
      .where('username', '=', username)
      .executeTakeFirst();
    if (customer)
      throw new HTTPException(400, { message: 'username has been used' });
  } catch (error) {
    if (error instanceof HTTPException) throw error;

    throw new HTTPException(500, {
      message: 'failed to verify username availability',
      cause: error,
    });
  }
}

export async function findCustomerByUsername(username: string) {
  try {
    return await db
      .selectFrom('customers')
      .selectAll()
      .where('username', '=', username)
      .executeTakeFirstOrThrow();
  } catch (error) {
    throw new HTTPException(404, {
      message: `customer with username ${username} is not found`,
      cause: error,
    });
  }
}

export async function updateCustomerProfileImage(
  username: string,
  fileId: string,
) {
  try {
    await db
      .updateTable('customers')
      .set({ profile_image: fileId })
      .where('username', '=', username)
      .executeTakeFirstOrThrow();
  } catch (error) {
    throw new HTTPException(400, {
      message: 'failed to set profile picture',
      cause: error,
    });
  }
}
