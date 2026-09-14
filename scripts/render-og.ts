/**
 * Renders the Open Graph card to a PNG.
 *
 * A static export cannot generate images at request time, so the card is a real
 * route (`/styleguide/og`) built from the same components as the rest of the
 * site, and this screenshots it. The output is committed, because the build
 * must not depend on a browser being available.
 *
 *   pnpm build && pnpm render:og
 *
 * Run it whenever the mark, the palette, the thesis or the star field changes.
 * `tests/design.test.ts` checks the file exists and is the right shape; it
 * cannot check whether it is current, so that part is on you.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from '@playwright/test';
import { findChromium, startStaticServer } from './static-server';

const SIZE = { width: 1200, height: 630 };
const OUT_PNG = join(process.cwd(), 'src', 'app', 'opengraph-image.png');
const OUT_ALT = join(process.cwd(), 'src', 'app', 'opengraph-image.alt.txt');

/**
 * The app icon, shot from the same `Mark` as everything else rather than
 * exported by hand. iOS will not take an SVG for a home-screen icon, so this
 * has to be a PNG, and a committed PNG that nothing regenerates is a PNG that
 * drifts from the mark it is supposed to be.
 */
const ICON_ROUTE = '/styleguide/icon';
const ICON = { size: 180, selector: '#app-icon' };
const OUT_ICON = join(process.cwd(), 'src', 'app', 'apple-icon.png');

/**
 * The sizes a browser actually asks an `.ico` for, each drawn by `Mark` at that
 * size so the ring thickens the way it is designed to. A single large render
 * resampled down is how a favicon becomes a smudge — and is what this file
 * replaced: the committed `favicon.ico` was still the framework's default.
 */
const FAVICON_SIZES = [16, 32, 48] as const;
const OUT_FAVICON = join(process.cwd(), 'src', 'app', 'favicon.ico');

/**
 * Pack PNGs into an ICO.
 *
 * The container is trivial — a six-byte header, one sixteen-byte directory
 * entry per image, then the payloads — and PNG-encoded entries have been
 * supported everywhere that matters for well over a decade, so there is no need
 * to hand-roll bottom-up BMP with an AND mask.
 */
function buildIco(images: { size: number; png: Buffer }[]): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = icon
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const directory: Buffer[] = [];

  for (const { size, png } of images) {
    const entry = Buffer.alloc(16);
    // 0 means 256 in this format; none of our sizes need that, but the encoding
    // is the same either way.
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2); // palette colours
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    directory.push(entry);
    offset += png.length;
  }

  return Buffer.concat([header, ...directory, ...images.map((i) => i.png)]);
}

const ALT_TEXT =
  'Merope, set in a light serif on warm paper, beside a chart of the Pleiades with Merope circled in red. The line reads: the star is not the point, what it lights up is.';

async function main() {
  const { server, origin } = await startStaticServer();
  const browser = await chromium.launch({ executablePath: findChromium() });

  const context = await browser.newContext({
    viewport: SIZE,
    // The card commits to plate: a social feed is mostly dark developer cards,
    // and warm paper is the more distinctive thing to be in that company.
    colorScheme: 'light',
    // 2x so the card stays sharp where platforms render it large.
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  const problems: string[] = [];
  page.on('pageerror', (err) => problems.push(err.message));

  await page.goto(`${origin}/styleguide/og`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  const card = page.locator('#og-card');
  if ((await card.count()) !== 1) {
    throw new Error('Expected exactly one #og-card on /styleguide/og');
  }

  await mkdir(join(process.cwd(), 'src', 'app'), { recursive: true });
  await card.screenshot({ path: OUT_PNG });
  await writeFile(OUT_ALT, `${ALT_TEXT}\n`, 'utf8');

  // The icons are captured in their own context: different sizes, and forced
  // light regardless of what the card wanted.
  const iconContext = await browser.newContext({
    viewport: { width: 640, height: 640 },
    colorScheme: 'light',
    deviceScaleFactor: 1,
  });
  const iconPage = await iconContext.newPage();
  iconPage.on('pageerror', (err) => problems.push(err.message));
  await iconPage.goto(`${origin}${ICON_ROUTE}`, { waitUntil: 'networkidle' });
  await iconPage.evaluate(() => document.fonts.ready);

  const shoot = async (selector: string, omitBackground: boolean) => {
    const target = iconPage.locator(selector);
    if ((await target.count()) !== 1) {
      throw new Error(`Expected exactly one ${selector} on ${ICON_ROUTE}`);
    }
    return target.screenshot({ omitBackground });
  };

  // Opaque: iOS composites transparency onto black.
  await writeFile(OUT_ICON, await shoot(ICON.selector, false));

  /**
   * The favicon is rasterised from `icon.svg`, not screenshotted from the page.
   *
   * Screenshotting was the obvious approach and it fought back: `omitBackground`
   * removes the browser's default backdrop, not a background the page itself
   * paints, and between `body`, the grain overlay and `color-scheme` there was
   * always one more opaque layer underneath. The icon kept coming out as a
   * warm-paper tile, which on dark browser chrome is a light square.
   *
   * Drawing the SVG onto a canvas is transparent by construction, and it ties
   * the `.ico` to the file a modern browser actually prefers — `icon.svg` — so
   * the two can never show different marks. `tests/design.test.ts` already
   * pins that SVG to `Mark.tsx`, so the chain holds all the way back.
   *
   * The SVG carries the small-size ring weight, which is the correct one for
   * every size in an `.ico`.
   */
  const encoded = await iconPage.evaluate(
    async (sizes: number[]) => {
      const svg = await (await fetch('/icon.svg')).text();
      const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
      const image = new Image();
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = () => reject(new Error('icon.svg failed to load'));
        image.src = url;
      });

      return sizes.map((size) => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('no 2d context');
        context.clearRect(0, 0, size, size);
        context.drawImage(image, 0, 0, size, size);
        return canvas.toDataURL('image/png');
      });
    },
    [...FAVICON_SIZES],
  );

  const favicons = FAVICON_SIZES.map((size, i) => ({
    size,
    png: Buffer.from(encoded[i].replace(/^data:image\/png;base64,/, ''), 'base64'),
  }));
  await writeFile(OUT_FAVICON, buildIco(favicons));

  await browser.close();
  server.close();

  if (problems.length) {
    console.error(problems.join('\n'));
    process.exit(1);
  }

  console.log(`og card  → src/app/opengraph-image.png (${SIZE.width}×${SIZE.height} @2x)`);
  console.log('alt text → src/app/opengraph-image.alt.txt');
  console.log(`app icon → src/app/apple-icon.png (${ICON.size}×${ICON.size})`);
  console.log(`favicon  → src/app/favicon.ico (${FAVICON_SIZES.join(', ')})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
