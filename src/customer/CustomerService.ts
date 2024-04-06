import { hash, verify as verifyPwd } from 'argon2';
import { password } from 'bun';
import { HTTPException } from 'hono/http-exception';
import { sign, verify } from 'hono/jwt';

import { env } from '../env';
import { type JWTPayload } from '../types';
import { createCustomer, findCustomerByUsername } from './CustomerRepository';
import {
  type CustomerLoginSchema,
  type CustomerRegisterSchema,
} from './CustomerSchema';

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

export async function customerLogin(payload: CustomerLoginSchema) {
  try {
    const customer = await findCustomerByUsername(payload.username);
    if (!(await verifyPwd(customer.password, payload.password))) {
      throw new HTTPException(401, { message: 'password is invalid' });
    }

    const accessToken = await sign(
      {
        sub: customer.id,
        username: customer.username,
        exp: Math.floor(Date.now() / 1000) + 5 * 60,
        iat: Date.now() / 1000,
        nbf: Date.now() / 1000,
      },
      env.JWT_ACCESS_KEY,
    );
    const refreshToken = await sign(
      {
        sub: customer.id,
        username: customer.username,
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
        iat: Date.now() / 1000,
        nbf: Date.now() / 1000,
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

export async function customerInspect(username: string) {
  const customer = await findCustomerByUsername(username);

  return { ...customer, password: undefined };
}

export async function customerRefreshToken(token: string) {
  try {
    const claims = (await verify(token, env.JWT_REFRESH_KEY)) as JWTPayload;
    const customer = await findCustomerByUsername(claims.username);

    const accessToken = await sign(
      {
        sub: customer.id,
        username: customer.username,
        exp: Math.floor(Date.now() / 1000) + 5 * 60,
        iat: Date.now() / 1000,
        nbf: Date.now() / 1000,
      },
      env.JWT_ACCESS_KEY,
    );
    const refreshToken = await sign(
      {
        sub: customer.id,
        username: customer.username,
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
        iat: Date.now() / 1000,
        nbf: Date.now() / 1000,
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
