import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { jwtware } from '../lib';
import { type JWTPayload } from '../user/UserService';
import { setSiteInfoSchema } from './SiteSchema';
import { setSiteInformation } from './SiteService';

const site = new Hono();

site.put('/', zValidator('json', setSiteInfoSchema), jwtware, async (c) => {
  const jwtPayload = c.get('jwtPayload') as JWTPayload;
  const payload = c.req.valid('json');

  const resp = await setSiteInformation({
    ...payload,
    user_id: jwtPayload.sub,
  });

  return c.json(resp);
});

export default site;
