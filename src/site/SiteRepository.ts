import { HTTPException } from 'hono/http-exception';
import { type Insertable } from 'kysely';
import { type SiteInformations } from 'kysely-codegen';
import { tryit } from 'radash';

export async function upsertSiteInformation(
  siteInfo: Insertable<SiteInformations>,
) {
  const [err] = await tryit(() =>
    db
      .insertInto('site_informations')
      .values(siteInfo)
      .onConflict((oc) => oc.column('user_id').doUpdateSet(siteInfo))
      .executeTakeFirstOrThrow(),
  )();
  if (err) {
    throw new HTTPException(400, {
      message: 'failed to set site information',
      cause: err,
    });
  }
}

export async function findMySiteInfo(userId: number) {
  const [err, site] = await tryit(() =>
    db
      .selectFrom('site_informations')
      .selectAll()
      .where('user_id', '=', userId)
      .execute(),
  )();
  if (err) {
    throw new HTTPException(500, {
      message: 'failed to get site information',
      cause: err,
    });
  }

  return site;
}
