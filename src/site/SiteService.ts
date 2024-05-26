import { tryit } from 'radash';
import { ulid } from 'ulid';

import { newPaginationMeta } from '@/lib';

import * as SiteRepository from './SiteRepository';
import { type SiteInformation } from './SiteSchema';

export async function upsert(userId: string, siteInfo: SiteInformation) {
  const [err] = await tryit(showByUserId)(userId);
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

export async function showByUserId(userId: string) {
  const site = await SiteRepository.showByUserId(Buffer.from(userId));

  return site;
}

export async function show(id: string) {
  const site = await SiteRepository.show(Buffer.from(id));

  return site;
}

export async function index(page: number, pageSize: number, q?: string) {
  const { totalItems, sites } = await SiteRepository.index(page, pageSize, q);

  return { meta: newPaginationMeta(page, pageSize, totalItems), data: sites };
}

export async function destroyByUserId(userId: string) {
  await SiteRepository.destroyByUserId(Buffer.from(userId));

  return { message: 'site info has been deleted' };
}
