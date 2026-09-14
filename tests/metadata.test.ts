import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SITE } from '@/lib/site';

/**
 * Contract test for the metadata in the built export.
 *
 * Asserted against `out/` rather than against the helper, because the bugs this
 * exists to prevent were both invisible in the source and obvious in the HTML:
 *
 *  - Next replaces `openGraph` wholesale rather than merging it, so a note page
 *    that declared `openGraph: { type: 'article' }` to get a published date
 *    silently dropped the site's card. Sharing a note produced a preview with
 *    no image, on a site whose card is generated from its own design system.
 *  - The root layout set `openGraph.url` once, and every page that did not
 *    override it inherited it — so every shared link on the site announced
 *    itself as the home page.
 *
 * Neither broke a build, a type, or a lint rule. Only the output showed it.
 */

const OUT = join(process.cwd(), 'out');

/** Pages that are deliberately not indexed and owe none of this. */
const EXEMPT = [/^styleguide/, /^404\./, /^_not-found/];

function builtPages(): { route: string; html: string }[] {
  if (!existsSync(OUT)) {
    throw new Error('No `out/` directory — run `pnpm build` before `pnpm test`.');
  }

  const pages: { route: string; html: string }[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (entry.endsWith('.html')) {
        const route = relative(OUT, full).replace(/\\/g, '/');
        if (EXEMPT.some((pattern) => pattern.test(route))) continue;
        pages.push({ route, html: readFileSync(full, 'utf8') });
      }
    }
  };
  walk(OUT);
  expect(pages.length, 'expected built pages in out/').toBeGreaterThan(3);
  return pages;
}

const attr = (html: string, pattern: RegExp) => pattern.exec(html)?.[1];

describe('every indexable page carries its own metadata', () => {
  const pages = builtPages();

  it.each(pages.map((p) => p.route))('%s declares a canonical URL', (route) => {
    const { html } = pages.find((p) => p.route === route)!;
    const canonical = attr(html, /rel="canonical" href="([^"]+)"/);
    expect(canonical, 'missing <link rel="canonical">').toBeDefined();
    expect(canonical!.startsWith(SITE.url)).toBe(true);
  });

  it.each(pages.map((p) => p.route))('%s has an og:url matching its canonical', (route) => {
    const { html } = pages.find((p) => p.route === route)!;
    // The whole bug: a shared link that tells the platform it is the home page.
    expect(attr(html, /og:url" content="([^"]+)"/)).toBe(
      attr(html, /rel="canonical" href="([^"]+)"/),
    );
  });

  it.each(pages.map((p) => p.route))('%s keeps the Open Graph card', (route) => {
    const { html } = pages.find((p) => p.route === route)!;
    const image = attr(html, /og:image" content="([^"]+)"/);
    expect(image, 'lost og:image — did this page override openGraph?').toBeDefined();
    expect(image).toContain('opengraph-image.png');
    expect(attr(html, /og:image:alt" content="([^"]+)"/)?.length ?? 0).toBeGreaterThan(20);
  });

  it('gives distinct canonicals to distinct pages', () => {
    const canonicals = pages.map((p) => attr(p.html, /rel="canonical" href="([^"]+)"/));
    expect(new Set(canonicals).size).toBe(canonicals.length);
  });
});

describe('the icons and manifest a browser goes looking for', () => {
  it.each(['apple-icon.png', 'icon.svg', 'favicon.ico', 'manifest.webmanifest'])(
    'serves /%s at a stable, unhashed path',
    (file) => {
      // The manifest references these by plain path, and an installed app keeps
      // that manifest long after this build's hashes are gone.
      expect(existsSync(join(OUT, file))).toBe(true);
    },
  );

  it('ships an apple touch icon that is a real 180x180 PNG', () => {
    const buf = readFileSync(join(OUT, 'apple-icon.png'));
    expect(buf.subarray(1, 4).toString('ascii')).toBe('PNG');
    expect(buf.readUInt32BE(16)).toBe(180);
    expect(buf.readUInt32BE(20)).toBe(180);
  });

  it('points the manifest at icons that exist', () => {
    const manifest = JSON.parse(readFileSync(join(OUT, 'manifest.webmanifest'), 'utf8'));
    expect(manifest.icons.length).toBeGreaterThan(0);
    for (const icon of manifest.icons) {
      expect(existsSync(join(OUT, icon.src.replace(/^\//, ''))), `${icon.src} missing`).toBe(true);
    }
  });
});
