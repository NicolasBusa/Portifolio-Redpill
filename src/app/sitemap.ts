import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getSiteUrl();
  return origin ? [{ url: origin }] : [];
}
