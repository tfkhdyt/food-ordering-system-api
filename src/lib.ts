import { type Context, type Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { jwt, sign } from 'hono/jwt';
import { tryit } from 'radash';

import { env } from './env';
import { type JWTPayload, type PaginationMeta } from './types';

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

export type CreateJwtOptions = {
  sub: string;
  username: string;
  role: 'user' | 'customer';
  type?: 'access' | 'refresh';
};

export async function createJwt({
  sub,
  username,
  role,
  type = 'access',
}: CreateJwtOptions) {
  const [err, jwt] = await tryit(sign)(
    {
      sub,
      username,
      role,
      exp:
        type === 'access'
          ? Math.floor(Date.now() / 1000) + 5 * 60
          : Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      iat: Date.now() / 1000,
      nbf: Date.now() / 1000,
    },
    type === 'access' ? env.JWT_ACCESS_KEY : env.JWT_REFRESH_KEY,
  );
  if (err) {
    throw new HTTPException(500, { message: `failed to create ${type} token` });
  }

  return jwt;
}

export function newPaginationMeta(
  page: number,
  pageSize: number,
  totalItems: number,
): PaginationMeta {
  return {
    page,
    page_size: pageSize,
    total_items: Number(totalItems),
    total_pages: Math.ceil(totalItems / pageSize),
  };
}
