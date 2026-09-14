import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';

/**
 * Written rather than hand-kept, so the sitemap URL and the host can never
 * disagree with `SITE`.
 *
 * `/styleguide` is disallowed because it is an internal review surface — it
 * already carries `robots: noindex`, and saying so twice costs nothing and
 * covers crawlers that read one signal and not the other.
 */
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/styleguide' },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
