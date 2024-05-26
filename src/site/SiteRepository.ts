import { HTTPException } from 'hono/http-exception';
import { type ExpressionBuilder } from 'kysely';
import { type Insertable, type Updateable } from 'kysely';
import { type DB, type SiteInformations } from 'kysely-codegen';
import { tryit } from 'radash';

export async function create(siteInfo: Insertable<SiteInformations>) {
  const [err] = await tryit(async () =>
    db
      .insertInto('site_informations')
      .values(siteInfo)
      .onConflict((oc) => oc.column('user_id').doNothing())
      .executeTakeFirstOrThrow(),
  )();
  if (err) {
    throw new HTTPException(400, {
      message: 'failed to create site information',
      cause: err,
    });
  }
}

export async function update(
  userId: Uint8Array,
  siteInfo: Updateable<SiteInformations>,
) {
  const [err] = await tryit(async () =>
    db
      .updateTable('site_informations')
      .set({ ...siteInfo, updated_at: new Date() })
      .where('user_id', '=', Buffer.from(userId))
      .executeTakeFirstOrThrow(),
  )();
  if (err) {
    throw new HTTPException(400, {
      message: 'failed to update site information',
      cause: err,
    });
  }
}

export async function showByUserId(userId: Uint8Array) {
  const [err, site] = await tryit(async () =>
    db
      .selectFrom('site_informations')
      .selectAll()
      .where('user_id', '=', Buffer.from(userId))
      .executeTakeFirstOrThrow(),
  )();
  if (err) {
    throw new HTTPException(404, {
      message: 'site information is not found',
      cause: err,
    });
  }

  return { ...site, user_id: site.user_id.toString(), id: site.id.toString() };
}

export async function show(id: Uint8Array) {
  const [err, site] = await tryit(async () =>
    db
      .selectFrom('site_informations')
      .selectAll()
      .where('id', '=', Buffer.from(id))
      .executeTakeFirstOrThrow(),
  )();
  if (err) {
    throw new HTTPException(404, {
      message: 'site information is not found',
      cause: err,
    });
  }

  return { ...site, user_id: site.user_id.toString(), id: site.id.toString() };
}

export async function index(page: number, pageSize: number, q?: string) {
  let query = db
    .selectFrom('site_informations')
    .selectAll()
    .offset(pageSize * (page - 1))
    .limit(pageSize);
  let queryCount = db
    .selectFrom('site_informations')
    .select(({ fn }) => [fn.countAll<number>().as('total_items')]);

  if (q) {
    const where = (eb: ExpressionBuilder<DB, 'site_informations'>) =>
      eb.or([
        eb('name', 'ilike', `%${q}%`),
        eb('address', 'ilike', `%${q}%`),
        eb('description', 'ilike', `%${q}%`),
        eb('contact_info', 'ilike', `%${q}%`),
      ]);

    query = query.where(where);
    queryCount = queryCount.where(where);
  }

  const [err, sites] = await tryit(async () => query.execute())();
  if (err)
    throw new HTTPException(500, {
      message: 'failed to find all sites',
      cause: err,
    });

  const [errCount, totalItems] = await tryit(async () =>
    queryCount.executeTakeFirstOrThrow(),
  )();
  if (errCount)
    throw new HTTPException(500, {
      message: 'failed to count all sites',
      cause: errCount,
    });

  return {
    totalItems: totalItems.total_items,
    sites: sites.map((s) => ({
      ...s,
      user_id: s.user_id.toString(),
      id: s.id.toString(),
    })),
  };
}

export async function destroyByUserId(userId: Uint8Array) {
  await showByUserId(userId);

  const [err] = await tryit(async () =>
    db
      .deleteFrom('site_informations')
      .where('user_id', '=', Buffer.from(userId))
      .executeTakeFirstOrThrow(),
  )();
  if (err)
    throw new HTTPException(500, {
      message: 'failed to delete site info',
      cause: err,
    });
}
