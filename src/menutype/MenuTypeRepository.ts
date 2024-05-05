import { HTTPException } from 'hono/http-exception';
import { Insertable } from 'kysely';
import { MenuTypes } from 'kysely-codegen';

export async function createMenuType(newMenuType: Insertable<MenuTypes>) {
  try {
    await verifyNameAvailability(newMenuType.name);

    await db
      .insertInto('menu_types')
      .values(newMenuType)
      .executeTakeFirstOrThrow();
  } catch (error) {
    if (error instanceof HTTPException) throw error;

    throw new HTTPException(400, {
      message: 'failed to create new menu',
      cause: error,
    });
  }
}

async function verifyNameAvailability(name: string) {
  try {
    const menu = await db
      .selectFrom('menu_types')
      .select('id')
      .where('name', '=', name)
      .executeTakeFirst();

    if (menu)
      throw new HTTPException(400, { message: 'menu type is already existed' });
  } catch (error) {
    if (error instanceof HTTPException) throw error;

    throw new HTTPException(500, {
      message: 'failed to verity menu type name availability',
      cause: error,
    });
  }
}

export async function findAllMenuTypes() {
  try {
    const menus = await db.selectFrom('menu_types').selectAll().execute();

    return menus;
  } catch (error) {
    throw new HTTPException(500, {
      message: 'failed to find all menus',
      cause: error,
    });
  }
}
