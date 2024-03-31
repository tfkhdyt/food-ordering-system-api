import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { createUserSchema } from './UserSchema';
import { register } from './UserService';

const user = new Hono();

user.post('/register', zValidator('json', createUserSchema), async (c) => {
  const payload = c.req.valid('json');

  const resp = await register(payload);

  return c.json(resp, { status: resp.statusCode });
});

export default user;
