import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { jwt } from 'hono/jwt';

import { env } from '../env';
import { loginSchema, refreshTokenSchema, registerSchema } from './UserSchema';
import {
  type JWTPayload,
  inspect,
  login,
  refreshToken,
  register,
} from './UserService';

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

user.get('/inspect', jwt({ secret: env.JWT_ACCESS_KEY }), async (c) => {
  const jwtPayload = c.get('jwtPayload') as JWTPayload;

  const resp = await inspect(jwtPayload.username);

  return c.json(resp);
});

user.post('/refresh', zValidator('json', refreshTokenSchema), async (c) => {
  const payload = c.req.valid('json');

  const resp = await refreshToken(payload.refresh_token);

  return c.json(resp, { status: resp.statusCode });
});

export default user;
