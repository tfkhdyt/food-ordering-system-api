import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { loginSchema, registerSchema } from './UserSchema';
import { login, register } from './UserService';

const user = new Hono();

user.post('/register', zValidator('json', registerSchema), async (c) => {
  const payload = c.req.valid('json');

  const resp = await register(payload);

  return c.json(resp, { status: resp.statusCode });
});

user.post('/login', zValidator('json', loginSchema), async (c) => {
  const payload = c.req.valid('json');

  const resp = await login(payload);

  return c.json(resp, { status: resp.statusCode });
});

export default user;
