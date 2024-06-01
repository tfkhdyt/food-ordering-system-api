import { ulid } from 'ulid';

import { newPaginationMeta } from '@/lib';
import * as MenuRepository from '@/menu/MenuRepository.js';
import type * as MenuSchema from '@/menu/MenuSchema.js';

export async function create(newMenu: MenuSchema.Create) {
  await MenuRepository.create({
    ...newMenu,
    id: Buffer.from(ulid()),
    type_id: Buffer.from(newMenu.type_id),
  });

  return { message: 'menu has been created' };
}

export async function index(
  page: number,
  pageSize: number,
  opts: MenuRepository.IndexOpts,
) {
  const { menus, totalItems } = await MenuRepository.index(
    page,
    pageSize,
    opts,
  );

  return { meta: newPaginationMeta(page, pageSize, totalItems), data: menus };
}

export async function show(id: string) {
  const menu = await MenuRepository.show(id);

  return { data: menu };
}
