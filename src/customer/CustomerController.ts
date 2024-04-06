import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { customerLoginSchema, customerRegisterSchema } from './CustomerSchema';
import { customerLogin, register } from './CustomerService';

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

export default customer;
