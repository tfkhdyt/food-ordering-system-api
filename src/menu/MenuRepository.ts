import { HTTPException } from 'hono/http-exception';
import { Insertable } from 'kysely';
import { Menus } from 'kysely-codegen';
import { tryit } from 'radash';

import * as MenuTypeRepository from '@/menu_type/MenuTypeRepository.js';

export async function create(newMenu: Insertable<Menus>) {
  await verifyNameAvailability(newMenu.name);
  await MenuTypeRepository.show(newMenu.type_id);

  const [err] = await tryit(() =>
    db.insertInto('menus').values(newMenu).executeTakeFirstOrThrow(),
  )();
  if (err)
    throw new HTTPException(400, {
      message: 'failed to create new menu',
      cause: err,
    });
}

async function verifyNameAvailability(name: string) {
  const [err, menu] = await tryit(() =>
    db
      .selectFrom('menus')
      .select('id')
      .where('name', '=', name)
      .executeTakeFirst(),
  )();
  if (err)
    throw new HTTPException(500, {
      message: 'failed to verity name availability',
      cause: err,
    });

  if (menu) throw new HTTPException(400, { message: 'name has been used' });
}
