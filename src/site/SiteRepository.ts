import { HTTPException } from 'hono/http-exception';
import { type Insertable, type Updateable } from 'kysely';
import { type SiteInformations } from 'kysely-codegen';
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
  userId: Buffer,
  siteInfo: Updateable<SiteInformations>,
) {
  const [err] = await tryit(async () =>
    db
      .updateTable('site_informations')
      .set({ ...siteInfo, updated_at: new Date() })
      .where('user_id', '=', userId)
      .executeTakeFirstOrThrow(),
  )();
  if (err) {
    throw new HTTPException(400, {
      message: 'failed to update site information',
      cause: err,
    });
  }
}

export async function show(userId: Buffer) {
  const [err, site] = await tryit(async () =>
    db
      .selectFrom('site_informations')
      .selectAll()
      .where('user_id', '=', userId)
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
