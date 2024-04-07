import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { jwtware } from '@/lib';
import { type JWTPayload } from '@/types';

import { setSiteInfoSchema } from './SiteSchema';
import { getSiteInformation, setSiteInformation } from './SiteService';

const site = new Hono();

site.put('/', zValidator('json', setSiteInfoSchema), jwtware, async (c) => {
  const jwtPayload = c.get('jwtPayload') as JWTPayload;
  const payload = c.req.valid('json');

  const resp = await setSiteInformation(jwtPayload.sub, payload);

  return c.json(resp);
});

site.get('/', jwtware, async (c) => {
  const jwtPayload = c.get('jwtPayload') as JWTPayload;
  const resp = await getSiteInformation(jwtPayload.sub);

  return c.json(resp);
});

export default site;
