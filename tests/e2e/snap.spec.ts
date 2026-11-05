import { devices, expect, test } from '@playwright/test';

/**
 * The site does not snap its scroll, on any pointer.
 *
 * It used to: the home page snapped to the top of each section with a mouse,
 * and not under a finger. The snap was removed because the browser decides
 * when it runs — on a Linux touchpad the scroll gesture often never reports its
 * end, so the snap fired on the next click and moved the page out from under
 * the pointer, footer links included. See the note on `html` in globals.css.
 *
 * These assert the absence directly, because the failure only ever showed on
 * hardware the suite does not have: no snap type on the root, no snap target
 * anywhere in the document, and a wheel scroll that ends where it was sent.
 */
const snapType = () => getComputedStyle(document.documentElement).scrollSnapType;

/** Every element and pseudo-element that would offer the scroller a snap point. */
const snapTargets = () =>
  [...document.querySelectorAll('*')].flatMap((el) =>
    [null, '::before', '::after']
      .filter((pseudo) => getComputedStyle(el, pseudo).scrollSnapAlign !== 'none')
      .map(
        (pseudo) =>
          `${el.tagName.toLowerCase()}${el.className ? `.${el.className}` : ''}${pseudo ?? ''}`,
      ),
  );

for (const path of ['/', '/projects', '/this-page-does-not-exist']) {
  test(`${path} does not snap`, async ({ page }) => {
    await page.goto(path);
    expect(await page.evaluate(snapType)).toBe('none');
    expect(await page.evaluate(snapTargets)).toEqual([]);
  });
}

test('the wheel reaches the footer and it stays under the pointer', async ({ page }) => {
  await page.goto('/');
  await page.mouse.move(700, 400);
  // Notch by notch, far more than the page is tall; the scroller clamps at its
  // end. Then let it settle: a snap acts after the scroll ends, so a check made
  // while it is still moving sees the bottom for a moment and passes anyway.
  for (let i = 0; i < 40; i++) {
    await page.mouse.wheel(0, 120);
    await page.waitForTimeout(30);
  }
  await page.waitForTimeout(1500);

  const end = () => document.documentElement.scrollHeight - innerHeight;
  expect(await page.evaluate(() => Math.round(scrollY))).toBe(await page.evaluate(end));

  const link = page.locator('footer a[href^="mailto:"]');
  const box = (await link.boundingBox())!;
  const at = { x: box.x + box.width / 2, y: box.y + box.height / 2 };

  // A click that lands somewhere else first must not move the page either.
  await page.mouse.click(5, at.y);
  expect(await page.evaluate(() => Math.round(scrollY))).toBe(await page.evaluate(end));

  const hit = await page.evaluate(
    ({ x, y }) => document.elementFromPoint(x, y)?.closest('a')?.getAttribute('href'),
    at,
  );
  expect(hit).toMatch(/^mailto:/);
});

test.describe('on a phone', () => {
  const { viewport, deviceScaleFactor, isMobile, hasTouch, userAgent } = devices['Pixel 7'];
  test.use({ viewport, deviceScaleFactor, isMobile, hasTouch, userAgent });

  test('does not snap', async ({ page }) => {
    await page.goto('/');
    expect(await page.evaluate(snapType)).toBe('none');
  });
});
