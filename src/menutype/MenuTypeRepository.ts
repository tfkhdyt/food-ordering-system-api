import { HTTPException } from 'hono/http-exception';
import { Insertable } from 'kysely';
import { MenuTypes } from 'kysely-codegen';
import { tryit } from 'radash';

export async function createMenuType(newMenuType: Insertable<MenuTypes>) {
  await verifyNameAvailability(newMenuType.name);

  const [errInsert] = await tryit(() =>
    db.insertInto('menu_types').values(newMenuType).executeTakeFirstOrThrow(),
  )();
  if (errInsert) {
    throw new HTTPException(400, {
      message: 'failed to insert new menu type',
      cause: errInsert,
    });
  }
}

async function verifyNameAvailability(name: string) {
  const [err, menu] = await tryit(() =>
    db
      .selectFrom('menu_types')
      .select('id')
      .where('name', '=', name)
      .executeTakeFirst(),
  )();
  if (err) {
    throw new HTTPException(500, {
      message: 'failed to verify name availability',
      cause: err,
    });
  }

  if (menu)
    throw new HTTPException(400, { message: 'menu type is already existed' });
}

export async function findAllMenuTypes() {
  const [err, menus] = await tryit(() =>
    db.selectFrom('menu_types').selectAll().execute(),
  )();

  if (err) {
    throw new HTTPException(500, {
      message: 'failed to find all menu types',
      cause: err,
    });
  }

  return menus;
}
