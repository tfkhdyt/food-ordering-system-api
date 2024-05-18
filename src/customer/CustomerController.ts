import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { jwtware } from '@/lib';
import { type JWTPayload } from '@/types';
import { refreshTokenSchema } from '@/user/UserSchema';

import {
  customerLoginSchema,
  customerRegisterSchema,
  setProfileImageSchema,
} from './CustomerSchema';
import * as CustomerService from './CustomerService';

const customer = new Hono();

customer.post(
  '/register',
  zValidator('json', customerRegisterSchema),
  async (c) => {
    const newCustomer = c.req.valid('json');

    const resp = await CustomerService.register(newCustomer);

    return c.json(resp, 201);
  },
);

customer.post('/login', zValidator('json', customerLoginSchema), async (c) => {
  const payload = c.req.valid('json');

  const resp = await CustomerService.login(payload);

  return c.json(resp, 201);
});

customer.get('/inspect', jwtware, async (c) => {
  const claims = c.get('jwtPayload') as JWTPayload;

  const resp = await CustomerService.inspect(claims.username);

  return c.json(resp);
});

customer.post('/refresh', zValidator('json', refreshTokenSchema), async (c) => {
  const payload = c.req.valid('json');

  const resp = await CustomerService.refreshToken(payload.refresh_token);

  return c.json(resp);
});

customer.patch(
  '/profile-images',
  zValidator('form', setProfileImageSchema),
  jwtware,
  async (c) => {
    const payload = c.req.valid('form');
    const claims = c.get('jwtPayload') as JWTPayload;

    const resp = await CustomerService.setProfileImage(
      payload.file,
      claims.username,
    );

    return c.json(resp);
  },
);

export default customer;
