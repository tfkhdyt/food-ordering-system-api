import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

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

export default menu;
