import { HTTPException } from 'hono/http-exception';

import { upsertSiteInformation } from './SiteRepository';
import { type SiteInformation } from './SiteSchema';

export async function setSiteInformation(siteInfo: SiteInformation) {
  if (!siteInfo.user_id) {
    throw new HTTPException(400, { message: 'user id is required' });
  }

  await upsertSiteInformation({
    ...siteInfo,
    user_id: siteInfo.user_id,
  });

  return { message: 'site information set successfully' };
}
