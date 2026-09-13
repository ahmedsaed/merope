/**
 * Visual verification harness.
 *
 * Serves the real static export and screenshots routes in both themes at both
 * breakpoints. This exists so changes get checked by looking at them rather
 * than by assuming — a green build proves nothing about whether a page is any
 * good.
 *
 *   pnpm shoot                      the home page
 *   pnpm shoot / /styleguide        specific routes
 */
import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from '@playwright/test';
import { findChromium, startStaticServer } from './static-server';

const SHOT_DIR = join(process.cwd(), '.shots');

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 960 },
  { name: 'mobile', width: 390, height: 844 },
] as const;

const THEMES = ['plate', 'sky'] as const;

async function main() {
  const routes = process.argv.slice(2).length ? process.argv.slice(2) : ['/'];

  await rm(SHOT_DIR, { recursive: true, force: true });
  await mkdir(SHOT_DIR, { recursive: true });

  const { server, origin } = await startStaticServer();
  const browser = await chromium.launch({ executablePath: findChromium() });
  const problems: string[] = [];

  for (const route of routes) {
    for (const viewport of VIEWPORTS) {
      for (const theme of THEMES) {
        const context = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
          deviceScaleFactor: 2,
          colorScheme: theme === 'sky' ? 'dark' : 'light',
        });
        const page = await context.newPage();

        // Console noise is a defect, not decoration: surface it.
        page.on('console', (msg) => {
          if (msg.type() === 'error') problems.push(`[${route} ${theme}] console: ${msg.text()}`);
        });
        page.on('pageerror', (err) =>
          problems.push(`[${route} ${theme}] pageerror: ${err.message}`),
        );

        // Pin the theme explicitly so the shot never depends on emulation alone.
        await page.addInitScript((t) => localStorage.setItem('merope.theme', t), theme);

        const response = await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
        if (!response || response.status() >= 400) {
          problems.push(`[${route}] HTTP ${response?.status() ?? 'no response'}`);
        }
        await page.evaluate(() => document.fonts.ready);

        const slug = route === '/' ? 'home' : route.replace(/^\//, '').replace(/\//g, '-');
        const file = join(SHOT_DIR, `${slug}--${viewport.name}--${theme}.png`);
        await page.screenshot({ path: file, fullPage: viewport.name === 'desktop' });
        console.log(`  ${file.replace(process.cwd() + '/', '')}`);

        await context.close();
      }
    }
  }

  await browser.close();
  server.close();

  if (problems.length) {
    console.error('\nProblems found:');
    for (const p of problems) console.error(`  ${p}`);
    process.exit(1);
  }
  console.log('\nClean: no console errors, no failed responses.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
