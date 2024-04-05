import { findMySiteInfo, upsertSiteInformation } from './SiteRepository';
import { type SiteInformation } from './SiteSchema';

export async function setSiteInformation(
  userId: number,
  siteInfo: SiteInformation,
) {
  await upsertSiteInformation({
    ...siteInfo,
    user_id: userId,
  });

  return { message: 'site information set successfully' };
}

export async function getSiteInformation(userId: number) {
  const site = await findMySiteInfo(userId);

  return site;
}
