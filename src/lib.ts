import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { jwt } from 'hono/jwt';

import { env } from './env';
import { JWTPayload } from './types';

export const jwtware = jwt({ secret: env.JWT_ACCESS_KEY });

export const userGuard = async (c: Context, next: Next) => {
  const jwtPayload = c.get('jwtPayload') as JWTPayload;

  if (jwtPayload.role !== 'user') {
    throw new HTTPException(403, {
      message: 'you are not authorized to access this endpoint',
    });
  }

  await next();
};
