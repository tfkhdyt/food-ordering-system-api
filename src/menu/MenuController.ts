import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { jwtware, userGuard } from '@/lib';

import * as MenuSchema from './MenuSchema.js';
import * as MenuService from './MenuService.js';

const menu = new Hono();

menu.post(
  '/',
  zValidator('json', MenuSchema.create),
  jwtware,
  userGuard,
  async (c) => {
    const newMenu = c.req.valid('json');
    const resp = await MenuService.create(newMenu);

    return c.json(resp, 201);
  },
);

menu.get(
  '/',
  zValidator(
    'query',
    z.object({
      page: z.coerce.number().min(1).default(1),
      page_size: z.coerce.number().min(1).default(10),
      status: z.enum(['available', 'out_of_stock']).optional(),
      type: z.string().ulid().optional(),
      query: z.string().optional(),
    }),
  ),
  async (c) => {
    const { page, page_size, status, type, query } = c.req.valid('query');

    const resp = await MenuService.index(page, page_size, {
      status,
      menuType: type,
      q: query,
    });

    return c.json(resp);
  },
);

menu.get(
  '/:id',
  zValidator(
    'param',
    z.object({
      id: z.string().ulid(),
    }),
  ),
  async (c) => {
    const { id } = c.req.valid('param');

    const resp = await MenuService.show(id);

    return c.json(resp);
  },
);

menu.patch(
  '/:id',
  zValidator(
    'param',
    z.object({
      id: z.string().ulid(),
    }),
  ),
  zValidator('json', MenuSchema.update),
  jwtware,
  userGuard,
  async (c) => {
    const { id } = c.req.valid('param');
    const payload = c.req.valid('json');

    const resp = await MenuService.update(id, payload);

    return c.json(resp);
  },
);

export default menu;
