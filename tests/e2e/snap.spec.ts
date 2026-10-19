import { devices, expect, test } from '@playwright/test';

/**
 * Section snapping is for a mouse or a trackpad. Under a finger, a flick's
 * momentum ends wherever it ends and the snap then drags the page to an edge
 * nobody aimed for, so touch devices get none. Both halves are asserted: it is
 * easy to fix the phone by deleting the rule for everyone.
 */
const snapType = () => getComputedStyle(document.documentElement).scrollSnapType;

test('snaps between sections with a fine pointer', async ({ page }) => {
  await page.goto('/');
  // Serialised as plain `y`: `proximity` is the default, so Chromium drops it.
  expect(await page.evaluate(snapType)).toMatch(/^y( proximity)?$/);
});

test.describe('on a phone', () => {
  const { viewport, deviceScaleFactor, isMobile, hasTouch, userAgent } = devices['Pixel 7'];
  test.use({ viewport, deviceScaleFactor, isMobile, hasTouch, userAgent });

  test('does not snap', async ({ page }) => {
    await page.goto('/');
    expect(await page.evaluate(snapType)).toBe('none');
  });

  test('does not snap held sideways, wider than the mobile breakpoint', async ({ page }) => {
    await page.setViewportSize({ width: viewport.height, height: viewport.width });
    await page.goto('/');
    expect(await page.evaluate(snapType)).toBe('none');
  });
});
