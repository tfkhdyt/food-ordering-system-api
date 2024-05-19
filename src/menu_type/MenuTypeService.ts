import { ulid } from 'ulid';

import { newPaginationMeta } from '@/lib';

import * as MenuTypeRepository from './MenuTypeRepository';
import { AddMenuTypeSchema } from './MenuTypeSchema';

export async function create(payload: AddMenuTypeSchema) {
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
