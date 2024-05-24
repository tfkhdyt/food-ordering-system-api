import { HTTPException } from 'hono/http-exception';
import { type Insertable } from 'kysely';
import { type ExpressionBuilder } from 'kysely';
import { type DB, type Menus } from 'kysely-codegen';
import { tryit } from 'radash';

import * as MenuTypeRepository from '@/menu_type/MenuTypeRepository.js';

export async function create(newMenu: Insertable<Menus>) {
  await verifyNameAvailability(newMenu.name);
  await MenuTypeRepository.show(newMenu.type_id);

  const [err] = await tryit(async () =>
    db.insertInto('menus').values(newMenu).executeTakeFirstOrThrow(),
  )();
  if (err)
    throw new HTTPException(400, {
      message: 'failed to create new menu',
      cause: err,
    });
}

async function verifyNameAvailability(name: string) {
  const [err, menu] = await tryit(async () =>
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

export type IndexOpts = {
  menuType?: string;
  status?: 'available' | 'out_of_stock';
  q?: string;
};

export async function index(
  page: number,
  pageSize: number,
  { menuType, status, q }: IndexOpts,
) {
  let query = db
    .selectFrom('menus')
    .selectAll()
    .limit(pageSize)
    .offset(pageSize * (page - 1))
    .orderBy('id asc');
  let queryCount = db
    .selectFrom('menus')
    .select(({ fn }) => [fn.countAll<number>().as('total_items')]);

  if (menuType) {
    query = query.where('type_id', '=', Buffer.from(menuType));
    queryCount = queryCount.where('type_id', '=', Buffer.from(menuType));
  }

  if (status) {
    query = query.where('status', '=', status);
    queryCount = queryCount.where('status', '=', status);
  }

  if (q) {
    const where = (eb: ExpressionBuilder<DB, 'menus'>) =>
      eb.or([
        eb('name', 'ilike', `%${q}%`),
        eb('ingredients', 'ilike', `%${q}%`),
      ]);
    query = query.where(where);
    queryCount = queryCount.where(where);
  }

  const [err, menus] = await tryit(async () => query.execute())();
  if (err)
    throw new HTTPException(500, {
      message: 'failed to find all menus',
      cause: err,
    });

  const [errCount, totalItems] = await tryit(async () =>
    queryCount.executeTakeFirstOrThrow(),
  )();
  if (errCount)
    throw new HTTPException(500, {
      message: 'failed to count all menus',
      cause: errCount,
    });

  return {
    totalItems: totalItems.total_items,
    menus: menus.map((m) => ({
      ...m,
      id: m.id.toString(),
      type_id: m.type_id.toString(),
    })),
  };
}
