import { hash } from 'argon2';
import { HTTPException } from 'hono/http-exception';

import { createCustomer } from './CustomerRepository';
import { type CustomerRegisterSchema } from './CustomerSchema';

export async function register(newCustomer: CustomerRegisterSchema) {
  try {
    newCustomer.password = await hash(newCustomer.password);
    await createCustomer(newCustomer);

    return { statusCode: 201, message: 'new customer has been created' };
  } catch (error) {
    if (error instanceof HTTPException) throw error;

    throw new HTTPException(500, {
      message: 'an error is occured',
      cause: error,
    });
  }
}
