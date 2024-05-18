import { tryit } from 'radash';
import { ulid } from 'ulid';

import * as SiteRepository from './SiteRepository';
import { type SiteInformation } from './SiteSchema';

export async function upsert(userId: string, siteInfo: SiteInformation) {
  const [err, site] = await tryit(show)(userId);
  if (err) {
    await SiteRepository.create({
      ...siteInfo,
      user_id: Buffer.from(userId),
      id: Buffer.from(ulid()),
    });
  } else {
    await SiteRepository.update(Buffer.from(userId), {
      ...siteInfo,
      user_id: Buffer.from(userId),
    });
  }

  return { message: 'site information set successfully' };
}

export async function show(userId: string) {
  const site = await SiteRepository.show(Buffer.from(userId, 'utf8'));

  return site;
}
