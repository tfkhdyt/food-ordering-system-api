import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { jwtware, userGuard } from '@/lib';

import * as MenuTypeSchema from './MenuTypeSchema';
import * as MenuTypeService from './MenuTypeService';

const menuType = new Hono();

menuType.post(
  '/',
  zValidator('json', MenuTypeSchema.create),
  jwtware,
  userGuard,
  async (c) => {
    const payload = c.req.valid('json');

    const resp = await MenuTypeService.create(payload);

    return c.json(resp, 201);
  },
);

menuType.get(
  '/',
  zValidator(
    'query',
    z.object({
      page: z.coerce.number().min(1).default(1),
      page_size: z.coerce.number().min(1).default(10),
      query: z.string().optional(),
    }),
  ),
  jwtware,
  async (c) => {
    const { page, page_size, query } = c.req.valid('query');
    const resp = await MenuTypeService.index(page, page_size, query);

    return c.json(resp);
  },
);

menuType.get(
  '/:id',
  zValidator('param', MenuTypeSchema.idParam),
  jwtware,
  async (c) => {
    const { id } = c.req.valid('param');

    const resp = await MenuTypeService.show(id);

    return c.json(resp);
  },
);

menuType.patch(
  '/:id',
  zValidator('param', MenuTypeSchema.idParam),
  zValidator('json', MenuTypeSchema.update),
  jwtware,
  userGuard,
  async (c) => {
    const { id } = c.req.valid('param');
    const newMenuType = c.req.valid('json');

    const resp = await MenuTypeService.update(id, newMenuType);

    return c.json(resp);
  },
);

menuType.delete(
  '/:id',
  zValidator('param', MenuTypeSchema.idParam),
  jwtware,
  userGuard,
  async (c) => {
    const { id } = c.req.valid('param');

    const resp = await MenuTypeService.destroy(id);

    return c.json(resp);
  },
);

export default menuType;
