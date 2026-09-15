import { expect, test, type Locator } from '@playwright/test';

/**
 * A release anchor is only worth having if a browser actually lands on it, and
 * every way this can fail is silent: a fragment that resolves to nothing leaves
 * the reader at the top of the page with no error anywhere. The ids themselves
 * are asserted against `out/` in `tests/anchors.test.ts`; this is the part only
 * a browser can answer.
 */

/** Where `--anchor-offset` says an anchored row comes to rest. */
const OFFSET = 40;

/**
 * `scroll-behavior: smooth` makes a fragment jump an animation, so the rest
 * position has to be polled rather than read once. Polling is also the honest
 * assertion: what matters is where the row ends up, not when.
 */
const comesToRest = (row: Locator) =>
  expect.poll(async () => Math.round((await row.boundingBox())!.y)).toBeCloseTo(OFFSET, -1);

test.describe('release anchors', () => {
  test('a version anchor lands on its own release', async ({ page }) => {
    await page.goto('/changelog#peace-1-6-0');

    const row = page.locator('#peace-1-6-0');
    await comesToRest(row);
    await expect(row.getByRole('link', { name: /v1\.6\.0/ })).toBeVisible();
  });

  test('the latest alias lands on the newest release of that project', async ({ page }) => {
    await page.goto('/changelog#peace-latest');

    // Which release that is, is deliberately not asserted — the alias exists so
    // a link to it never has to be edited, and neither does this test. What is
    // asserted is that it is the project's first row on the page.
    const row = page.locator('li', { has: page.locator('#peace-latest') });
    await comesToRest(row);

    const version = await row.locator('a.anchor-link').first().innerText();
    const first = page.locator('li:has(a[href^="/projects/peace"]) a.anchor-link').first();
    expect(await first.innerText()).toBe(version);
  });

  test('the same aliases work on the project page', async ({ page }) => {
    await page.goto('/projects/peace#peace-latest');
    await comesToRest(page.locator('li', { has: page.locator('#peace-latest') }));
  });

  test('the releases section of a project page is addressable', async ({ page }) => {
    await page.goto('/projects/peace#releases');
    await comesToRest(page.locator('#releases'));
  });

  test('clicking a version puts it in the address bar', async ({ page }) => {
    await page.goto('/changelog');
    await page.locator('#peace-1-5-0 a.anchor-link').first().click();

    expect(new URL(page.url()).hash).toBe('#peace-1-5-0');
    await comesToRest(page.locator('#peace-1-5-0'));
  });

  test('a release body no longer claims anchors of its own', async ({ page }) => {
    // Every release has a section called Added. Slugging them put eight
    // elements called `added` on this page, and `#added` resolved to the first.
    await page.goto('/changelog');
    await expect(page.locator('#added')).toHaveCount(0);
    await expect(page.locator('.prose-tight a.anchor-link')).toHaveCount(0);
  });
});
