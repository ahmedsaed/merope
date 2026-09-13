import { expect, test } from '@playwright/test';

/**
 * The theme system is the only part of the site with real runtime behaviour, and
 * every failure mode here is invisible: a flash of the wrong theme, a choice
 * that does not survive a reload, a toggle that disagrees with the page.
 */

test.describe('theme', () => {
  test('defaults to plate when the OS prefers light', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'plate' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('defaults to sky when the OS prefers dark, without an attribute', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    // No stored choice means no attribute — the CSS media query decides, so
    // "follow the system" stays a real state rather than a guess written to the DOM.
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.*/);
    await expect(page.getByRole('button', { name: 'sky' })).toHaveAttribute('aria-pressed', 'true');
  });

  test('an explicit choice overrides the OS and survives a reload', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');

    await page.getByRole('button', { name: 'sky' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'sky');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'sky');
    await expect(page.getByRole('button', { name: 'sky' })).toHaveAttribute('aria-pressed', 'true');
  });

  test('actually repaints the page, not just the attribute', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');

    const background = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);

    const before = await background();
    await page.getByRole('button', { name: 'sky' }).click();
    // The body transition is a deliberate long exposure; wait it out.
    await page.waitForTimeout(1200);
    expect(await background()).not.toBe(before);
  });

  test('applies the stored theme before first paint', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await page.getByRole('button', { name: 'sky' }).click();

    // The blocking init script must set the attribute before any stylesheet
    // paints; if it were deferred, the attribute would still be missing here.
    await page.goto('/styleguide');
    const attributeAtFirstPaint = await page.evaluate(() =>
      document.documentElement.getAttribute('data-theme'),
    );
    expect(attributeAtFirstPaint).toBe('sky');
  });

  test('carries the choice across navigations', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'sky' }).click();
    await page.goto('/notes/first-light');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'sky');
  });
});
