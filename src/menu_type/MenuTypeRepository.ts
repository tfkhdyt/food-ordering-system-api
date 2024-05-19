import { HTTPException } from 'hono/http-exception';
import { ExpressionBuilder, Updateable } from 'kysely';
import { Insertable } from 'kysely';
import { DB, MenuTypes } from 'kysely-codegen';
import { tryit } from 'radash';

export async function create(newMenuType: Insertable<MenuTypes>) {
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

export async function index(page: number, pageSize: number, q?: string) {
  const offset = pageSize * (page - 1);

  let query = db
    .selectFrom('menu_types')
    .selectAll()
    .offset(offset)
    .limit(pageSize)
    .orderBy('id asc');
  let queryCount = db
    .selectFrom('menu_types')
    .select(({ fn }) => [fn.countAll<number>().as('total_items')]);

  if (q) {
    const where = (eb: ExpressionBuilder<DB, 'menu_types'>) =>
      eb.or([
        eb('description', 'ilike', `%%${q}%%`),
        eb('name', 'ilike', `%%${q}%%`),
      ]);

    query = query.where(where);
    queryCount = queryCount.where(where);
  }

  const [err, menus] = await tryit(() => query.execute())();
  if (err) {
    throw new HTTPException(500, {
      message: 'failed to find all menu types',
      cause: err,
    });
  }

  const [errCount, totalItems] = await tryit(() =>
    queryCount.executeTakeFirstOrThrow(),
  )();
  if (errCount) {
    throw new HTTPException(500, {
      message: 'failed to count all menu types',
      cause: err,
    });
  }

  const menus_ = menus?.map((m) => ({ ...m, id: m.id.toString() }));

  return { menus: menus_, totalItems: Number(totalItems.total_items) };
}

export async function show(id: Buffer) {
  const [err, menuType] = await tryit(() =>
    db
      .selectFrom('menu_types')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirstOrThrow(),
  )();
  if (err) {
    throw new HTTPException(404, {
      message: 'menu type is not found',
      cause: err,
    });
  }

  return { ...menuType, id: menuType.id.toString() };
}

export async function update(id: Buffer, newMenuType: Updateable<MenuTypes>) {
  await show(id);

  const [err] = await tryit(() =>
    db
      .updateTable('menu_types')
      .set(newMenuType)
      .where('id', '=', id)
      .executeTakeFirstOrThrow(),
  )();
  if (err)
    throw new HTTPException(400, {
      message: 'failed to update menu type',
      cause: err,
    });
}
