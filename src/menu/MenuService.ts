import { ulid } from 'ulid';

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
