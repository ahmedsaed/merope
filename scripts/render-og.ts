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
const ICON = { size: 180, route: '/styleguide/icon', selector: '#app-icon' };
const OUT_ICON = join(process.cwd(), 'src', 'app', 'apple-icon.png');

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

  // The icon is captured in its own context: it is a different size, and it
  // must be opaque plate regardless of what the card wanted.
  const iconContext = await browser.newContext({
    viewport: { width: ICON.size, height: ICON.size },
    colorScheme: 'light',
    deviceScaleFactor: 1,
  });
  const iconPage = await iconContext.newPage();
  iconPage.on('pageerror', (err) => problems.push(err.message));
  await iconPage.goto(`${origin}${ICON.route}`, { waitUntil: 'networkidle' });
  await iconPage.evaluate(() => document.fonts.ready);

  const icon = iconPage.locator(ICON.selector);
  if ((await icon.count()) !== 1) {
    throw new Error(`Expected exactly one ${ICON.selector} on ${ICON.route}`);
  }
  await icon.screenshot({ path: OUT_ICON });

  await browser.close();
  server.close();

  if (problems.length) {
    console.error(problems.join('\n'));
    process.exit(1);
  }

  console.log(`og card  → src/app/opengraph-image.png (${SIZE.width}×${SIZE.height} @2x)`);
  console.log('alt text → src/app/opengraph-image.alt.txt');
  console.log(`app icon → src/app/apple-icon.png (${ICON.size}×${ICON.size})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
