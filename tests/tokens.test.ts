import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { MAGNITUDE_CLASSES } from '@/lib/merope';

/**
 * Contract test for the built stylesheet.
 *
 * Tailwind v4 removes theme variables that no generated utility references. Any
 * token the UI reads through `var(--x)` in an inline style or a hand-written
 * rule therefore has to be declared `@theme static`, or it vanishes from the
 * bundle — and because a missing `opacity` value just falls back to 1, the page
 * keeps rendering and nothing anywhere reports a problem.
 *
 * That already happened once. This is the guard.
 */

const OUT = join(process.cwd(), 'out');

function builtCss(): string {
  if (!existsSync(OUT)) {
    throw new Error('No `out/` directory — run `pnpm build` before `pnpm test`.');
  }
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (entry.endsWith('.css')) files.push(full);
    }
  };
  walk(OUT);
  expect(files.length, 'expected at least one stylesheet in out/').toBeGreaterThan(0);
  return files.map((f) => readFileSync(f, 'utf8')).join('\n');
}

describe('design tokens survive the build', () => {
  const css = builtCss();

  it.each(MAGNITUDE_CLASSES.map((m) => m.mag))(
    'emits --mag-%i even when no utility references it',
    (mag) => {
      expect(css).toMatch(new RegExp(`--mag-${mag}\\s*:`));
    },
  );

  it('emits --pogson, which no utility will ever reference', () => {
    expect(css).toMatch(/--pogson\s*:/);
  });

  it.each([
    '--ground',
    '--surface',
    '--raised',
    '--ink',
    '--ink-muted',
    '--ink-faint',
    '--rule',
    '--rule-strong',
    '--accent',
    '--accent-soft',
    '--mark',
    '--mark-soft',
    '--glow',
  ])('defines %s in both themes', (token) => {
    // Once for plate, once for sky, once for the prefers-color-scheme fallback.
    const occurrences = css.match(new RegExp(`${token}\\s*:`, 'g')) ?? [];
    expect(occurrences.length).toBeGreaterThanOrEqual(3);
  });

  it('ships a sky theme selector', () => {
    expect(css).toMatch(/\[data-theme=.?sky.?\]/);
  });

  it('honours prefers-color-scheme when no theme is chosen', () => {
    expect(css).toMatch(/prefers-color-scheme\s*:\s*dark/);
  });
});
