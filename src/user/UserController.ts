import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { jwtware } from '@/lib';
import { type JWTPayload } from '@/types';

import { loginSchema, refreshTokenSchema, registerSchema } from './UserSchema';
import * as UserService from './UserService';

const user = new Hono();

user.post('/register', zValidator('json', registerSchema), async (c) => {
  const payload = c.req.valid('json');

  const resp = await UserService.register(payload);

  return c.json(resp, 201);
});

user.post('/login', zValidator('json', loginSchema), async (c) => {
  const payload = c.req.valid('json');

  const resp = await UserService.login(payload);

  return c.json(resp, 201);
});

user.get('/inspect', jwtware, async (c) => {
  const jwtPayload = c.get('jwtPayload') as JWTPayload;

  const resp = await UserService.inspect(jwtPayload.username);

  return c.json(resp);
});

user.post('/refresh', zValidator('json', refreshTokenSchema), async (c) => {
  const payload = c.req.valid('json');

  const resp = await UserService.refreshToken(payload.refresh_token);

  return c.json(resp);
});

export default user;
