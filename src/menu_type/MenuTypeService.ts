import { ulid } from 'ulid';

import { newPaginationMeta } from '@/lib';

import * as MenuTypeRepository from './MenuTypeRepository';
import type * as MenuTypeSchema from './MenuTypeSchema';

export async function create(payload: MenuTypeSchema.Create) {
  await MenuTypeRepository.create({
    ...payload,
    id: Buffer.from(ulid()),
  });

  return { message: 'new menu type is created' };
}

export async function index(page: number, pageSize: number, q?: string) {
  const { menus, totalItems } = await MenuTypeRepository.index(
    page,
    pageSize,
    q,
  );

  return { meta: newPaginationMeta(page, pageSize, totalItems), data: menus };
}

export async function show(id: string) {
  const menuType = await MenuTypeRepository.show(Buffer.from(id));

  return { data: menuType };
}

export async function update(id: string, newMenuType: MenuTypeSchema.Update) {
  await MenuTypeRepository.update(Buffer.from(id), newMenuType);

  return { message: 'menu type has been updated' };
}

export async function destroy(id: string) {
  await MenuTypeRepository.destroy(Buffer.from(id));

  return { message: 'menu type has been deleted' };
}
