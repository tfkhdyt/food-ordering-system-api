import { jwt } from 'hono/jwt';

import { env } from './env';

export const jwtware = jwt({ secret: env.JWT_ACCESS_KEY });
