import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { jwtware } from '../lib';
import { type JWTPayload } from '../types';
import { refreshTokenSchema } from '../user/UserSchema';
import { customerLoginSchema, customerRegisterSchema } from './CustomerSchema';
import {
  customerInspect,
  customerLogin,
  customerRefreshToken,
  register,
} from './CustomerService';

const customer = new Hono();

customer.post(
  '/register',
  zValidator('json', customerRegisterSchema),
  async (c) => {
    const newCustomer = c.req.valid('json');

    const resp = await register(newCustomer);

    return c.json(resp, { status: resp.statusCode });
  },
);

customer.post('/login', zValidator('json', customerLoginSchema), async (c) => {
  const payload = c.req.valid('json');

  const resp = await customerLogin(payload);

  return c.json(resp, { status: resp.statusCode });
});

customer.get('/inspect', jwtware, async (c) => {
  const claims = c.get('jwtPayload') as JWTPayload;

  const resp = await customerInspect(claims.username);

  return c.json(resp);
});

customer.post('/refresh', zValidator('json', refreshTokenSchema), async (c) => {
  const payload = c.req.valid('json');

  const resp = await customerRefreshToken(payload.refresh_token);

  return c.json(resp, { status: resp.statusCode });
});

export default customer;
