import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { jwtware, userGuard } from '@/lib';

import { addMenuTypeSchema } from './MenuTypeSchema';
import { addMenuType, listMenuTypes } from './MenuTypeService';

const menuType = new Hono();

menuType.post(
  '/',
  zValidator('json', addMenuTypeSchema),
  jwtware,
  userGuard,
  async (c) => {
    const payload = c.req.valid('json');

    const resp = await addMenuType(payload);

    return c.json(resp, 201);
  },
);

menuType.get('/', jwtware, async (c) => {
  const resp = await listMenuTypes();

  return c.json(resp);
});

export default menuType;
