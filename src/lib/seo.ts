import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Metadata } from 'next';
import { SITE } from './site';

/**
 * Page metadata, built one way.
 *
 * Next merges most metadata fields with the parent layout's, but `openGraph` is
 * replaced wholesale by any page that declares it — so a note page that set
 * `openGraph: { type: 'article' }` to get a published date silently threw away
 * the site's Open Graph image, its `og:url` and its `og:site_name`. Sharing a
 * note produced a card with no picture on a site whose card is generated from
 * its own design system. That is the bug this exists to make impossible.
 *
 * The second one it fixes: the root layout set `openGraph.url` to the site root,
 * and every page that did not override it inherited that. Every shared link on
 * the site announced itself as the home page.
 *
 * So every route calls this, passes its own path, and gets a canonical URL, a
 * correct `og:url` and the card back.
 */

/**
 * Read from the file the render script writes, rather than copied into a string
 * here. The alt text describes a picture that is regenerated whenever the mark,
 * the palette or the star field changes; a second copy would describe the old
 * one. Build-time only — metadata never reaches the browser.
 */
const ogAlt = readFileSync(join(process.cwd(), 'src/app/opengraph-image.alt.txt'), 'utf8').trim();

/**
 * The card, declared explicitly so a page that overrides `openGraph` keeps it.
 * The path has no content hash on purpose: Next emits a hashed URL of its own,
 * but the file is also served at this stable path, and a stable path is what a
 * crawler that cached the old one will come back to.
 */
const ogImage = {
  url: '/opengraph-image.png',
  width: 2400,
  height: 1260,
  alt: ogAlt,
} as const;

type PageMeta = {
  /** Omit on the home page, which uses the site's own title verbatim. */
  title?: string;
  description: string;
  /** Route path, leading slash, no trailing slash. `/` for the home page. */
  path: string;
  /** `article` adds the dates below and is for notes. */
  type?: 'website' | 'article';
  published?: Date;
  modified?: Date;
};

export function pageMetadata({
  title,
  description,
  path,
  type = 'website',
  published,
  modified,
}: PageMeta): Metadata {
  const url = path === '/' ? SITE.url : `${SITE.url}${path}`;

  return {
    ...(title ? { title } : {}),
    description,
    // Static exports are reachable at more than one address — with and without
    // a trailing slash, on the preview domain as well as the real one — so
    // saying which is the real one is not optional.
    alternates: { canonical: url },
    openGraph: {
      type,
      url,
      siteName: SITE.name,
      title: title ? `${title} · ${SITE.name}` : `${SITE.name} — ${SITE.tagline}`,
      description,
      locale: 'en_GB',
      images: [ogImage],
      ...(published ? { publishedTime: published.toISOString() } : {}),
      ...(modified ? { modifiedTime: modified.toISOString() } : {}),
    },
  };
}
