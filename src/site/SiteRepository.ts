import { HTTPException } from 'hono/http-exception';
import { type Insertable } from 'kysely';
import { type SiteInformations } from 'kysely-codegen';

export async function upsertSiteInformation(
  siteInfo: Insertable<SiteInformations>,
) {
  try {
    await db
      .insertInto('site_informations')
      .values(siteInfo)
      .onConflict((oc) => oc.column('user_id').doUpdateSet(siteInfo))
      .executeTakeFirstOrThrow();
  } catch (error) {
    throw new HTTPException(400, {
      message: 'failed to set site information',
      cause: error,
    });
  }
}

export async function findMySiteInfo(userId: number) {
  try {
    return await db
      .selectFrom('site_informations')
      .selectAll()
      .where('user_id', '=', userId)
      .execute();
  } catch (error) {
    throw new HTTPException(500, {
      message: 'failed to get site information',
      cause: error,
    });
  }
}
