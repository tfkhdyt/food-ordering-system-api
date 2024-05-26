import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { jwtware, userGuard } from '@/lib';
import { type JWTPayload } from '@/types';

import { setSiteInfoSchema } from './SiteSchema';
import * as SiteService from './SiteService';

const site = new Hono();

// Upsert
site.put(
  '/',
  zValidator('json', setSiteInfoSchema),
  jwtware,
  userGuard,
  async (c) => {
    const jwtPayload = c.get('jwtPayload') as JWTPayload;
    const payload = c.req.valid('json');

    const resp = await SiteService.upsert(jwtPayload.sub, payload);

    return c.json(resp);
  },
);

// Show (me)
site.get('/me', jwtware, userGuard, async (c) => {
  const jwtPayload = c.get('jwtPayload') as JWTPayload;
  const resp = await SiteService.showByUserId(jwtPayload.sub);

  return c.json(resp);
});

// Show
site.get(
  '/:id',
  zValidator(
    'param',
    z.object({
      id: z.string().ulid(),
    }),
  ),
  async (c) => {
    const { id } = c.req.valid('param');

    const resp = await SiteService.show(id);

    return c.json(resp);
  },
);

// Index
site.get(
  '/',
  zValidator(
    'query',
    z.object({
      page: z.coerce.number().min(1).default(1),
      page_size: z.coerce.number().min(1).default(10),
      query: z.string().optional(),
    }),
  ),
  async (c) => {
    const { page, page_size, query } = c.req.valid('query');
    const resp = await SiteService.index(page, page_size, query);

    return c.json(resp);
  },
);

// Delete
site.delete('/me', jwtware, userGuard, async (c) => {
  const jwtPayload = c.get('jwtPayload') as JWTPayload;

  const resp = await SiteService.destroyByUserId(jwtPayload.sub);

  return c.json(resp);
});

export default site;
