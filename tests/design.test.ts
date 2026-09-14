import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Guards for design assets that live in two places at once.
 *
 * A favicon renders outside the document and cannot read CSS variables, so
 * `src/app/icon.svg` carries literal hex and a hand-copied path. That duplication
 * is unavoidable; letting it drift silently is not.
 */

const root = process.cwd();
const icon = readFileSync(join(root, 'src', 'app', 'icon.svg'), 'utf8');
const mark = readFileSync(join(root, 'src', 'design', 'components', 'Mark.tsx'), 'utf8');

/** Pulls the ring path out of either file. Both draw exactly one path. */
function ringPath(source: string): string {
  const match = source.match(/d="(M15 3\.2[^"]+)"/);
  if (!match) throw new Error('no ring path found');
  return match[1].replace(/\s+/g, ' ').trim();
}

describe('the favicon tracks the mark', () => {
  it('draws the identical ring', () => {
    expect(ringPath(icon)).toBe(ringPath(mark));
  });

  it('uses the same viewBox, so the geometry means the same thing', () => {
    expect(icon).toMatch(/viewBox="0 0 30 30"/);
    expect(mark).toMatch(/viewBox="0 0 30 30"/);
  });

  it('carries the resolved token colours rather than invented ones', () => {
    // oklch(0.505 0.118 237) and oklch(0.545 0.170 32), converted to sRGB.
    // Hand-picking approximate hex here is exactly how a brand drifts.
    expect(icon).toContain('#006d9f');
    expect(icon).toContain('#bf3d27');
  });

  it('keeps the star inside the ring at favicon scale', () => {
    const r = icon.match(/<circle[^>]*r="([\d.]+)"/);
    expect(r).not.toBeNull();
    expect(Number(r?.[1])).toBeLessThan(8.4);
  });
});

describe('the Open Graph card', () => {
  const png = join(root, 'src', 'app', 'opengraph-image.png');

  it('is committed, because the build cannot assume a browser', () => {
    expect(existsSync(png)).toBe(true);
  });

  it('is a real PNG at 2x of 1200x630', () => {
    const buf = readFileSync(png);
    expect(buf.subarray(1, 4).toString('ascii')).toBe('PNG');
    // IHDR width/height are big-endian uint32 at byte 16 and 20.
    expect(buf.readUInt32BE(16)).toBe(2400);
    expect(buf.readUInt32BE(20)).toBe(1260);
  });

  it('ships alt text, because a card with none is unreadable to some readers', () => {
    const alt = readFileSync(join(root, 'src', 'app', 'opengraph-image.alt.txt'), 'utf8');
    expect(alt.trim().length).toBeGreaterThan(40);
  });
});

describe('theme-color matches the themes', () => {
  const theme = readFileSync(join(root, 'src', 'design', 'theme.ts'), 'utf8');
  const layout = readFileSync(join(root, 'src', 'app', 'layout.tsx'), 'utf8');
  const manifest = readFileSync(join(root, 'src', 'app', 'manifest.ts'), 'utf8');

  /**
   * `theme-color` and the manifest's `background_color` are read by browser
   * chrome and by the OS, neither of which has a stylesheet — so both need hex,
   * and tokens.css is authoritative and written in oklch. The hazard is the
   * same one `icon.svg` has: a hand-converted copy that drifts from the value
   * it mirrors. There is one copy, and this is what pins it.
   */
  it('keeps the resolved ground colours, not approximations', () => {
    expect(theme).toContain('#f6f3ed'); // plate --plate-stock
    expect(theme).toContain('#090e17'); // sky --sky-void
  });

  it('has exactly one copy of them, which is the point of the constant', () => {
    for (const [name, source] of [
      ['layout.tsx', layout],
      ['manifest.ts', manifest],
    ] as const) {
      expect(source, `${name} re-inlined a literal instead of using THEME_COLORS`).not.toMatch(
        /#[0-9a-fA-F]{6}/,
      );
      expect(source).toContain('THEME_COLORS');
    }
  });
});
