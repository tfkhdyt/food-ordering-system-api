import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { customerRegisterSchema } from './CustomerSchema';
import { register } from './CustomerService';

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

export default customer;
