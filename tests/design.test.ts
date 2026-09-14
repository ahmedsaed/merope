import { existsSync, readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
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

/* ------------------------------------------------------------------------ */

/** One image inside an `.ico`: the declared size and its raw payload. */
function icoEntries(buf: Buffer): { size: number; payload: Buffer }[] {
  expect(buf.readUInt16LE(0), 'reserved field').toBe(0);
  expect(buf.readUInt16LE(2), 'type — 1 is an icon').toBe(1);

  const count = buf.readUInt16LE(4);
  const entries: { size: number; payload: Buffer }[] = [];
  for (let i = 0; i < count; i += 1) {
    const dir = 6 + i * 16;
    const size = buf.readUInt8(dir) || 256;
    const length = buf.readUInt32LE(dir + 8);
    const offset = buf.readUInt32LE(dir + 12);
    entries.push({ size, payload: buf.subarray(offset, offset + length) });
  }
  return entries;
}

/**
 * Enough of a PNG decoder to read the pixels back out.
 *
 * Worth the thirty lines: without it the only thing a test can say about an
 * icon file is that it exists and is the right shape, which is exactly what was
 * true of the framework's default favicon while it shipped as this site's own.
 */
function decodePng(buf: Buffer): { width: number; height: number; rgba: Buffer } {
  let pos = 8;
  let width = 0;
  let height = 0;
  const idat: Buffer[] = [];

  while (pos < buf.length) {
    const length = buf.readUInt32BE(pos);
    const type = buf.subarray(pos + 4, pos + 8).toString('ascii');
    const data = buf.subarray(pos + 8, pos + 8 + length);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      expect(data.readUInt8(8), 'bit depth').toBe(8);
      expect(data.readUInt8(9), 'colour type — 6 is RGBA').toBe(6);
    }
    if (type === 'IDAT') idat.push(Buffer.from(data));
    pos += 12 + length;
  }

  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * 4;
  const rgba = Buffer.alloc(stride * height);

  for (let y = 0; y < height; y += 1) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, y * (stride + 1) + 1 + stride);
    for (let x = 0; x < stride; x += 1) {
      const a = x >= 4 ? rgba[y * stride + x - 4] : 0;
      const b = y > 0 ? rgba[(y - 1) * stride + x] : 0;
      const c = x >= 4 && y > 0 ? rgba[(y - 1) * stride + x - 4] : 0;
      let value = line[x];
      if (filter === 1) value += a;
      else if (filter === 2) value += b;
      else if (filter === 3) value += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        value += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      rgba[y * stride + x] = value & 0xff;
    }
  }

  return { width, height, rgba };
}

/** How far apart two colours are, crudely but sufficiently. */
const distance = (a: number[], b: number[]) =>
  Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);

describe("the favicon is this site's mark, not a leftover", () => {
  const ico = readFileSync(join(root, 'src', 'app', 'favicon.ico'));
  const entries = icoEntries(ico);

  it('carries the sizes a browser actually asks for', () => {
    // Not one big image for the browser to resample. The ring thickens as the
    // mark shrinks, and downscaling a 256px render throws that away.
    expect(entries.map((e) => e.size)).toEqual([16, 32, 48]);
  });

  it("draws the mark at 16px, in the mark's own colours", () => {
    /**
     * The test that matters. `src/app/favicon.ico` was the framework's default
     * — a black disc with a white triangle — through three phases of work, and
     * every check the project had still passed, because none of them looked
     * inside the file.
     */
    const smallest = entries.find((e) => e.size === 16);
    expect(smallest).toBeDefined();

    const { width, height, rgba } = decodePng(smallest!.payload);
    expect([width, height]).toEqual([16, 16]);

    const star = [0x00, 0x6d, 0x9f]; // --accent, resolved
    const pencil = [0xbf, 0x3d, 0x27]; // --mark, resolved
    let hasStar = false;
    let hasPencil = false;
    let opaquePixels = 0;

    for (let i = 0; i < rgba.length; i += 4) {
      if (rgba[i + 3] < 128) continue;
      opaquePixels += 1;
      const pixel = [rgba[i], rgba[i + 1], rgba[i + 2]];
      if (distance(pixel, star) < 90) hasStar = true;
      if (distance(pixel, pencil) < 90) hasPencil = true;
    }

    expect(hasStar, 'no accent-coloured star in the favicon').toBe(true);
    expect(hasPencil, 'no grease-pencil ring in the favicon').toBe(true);
    // A mark, not a filled tile: the corners outside the ring stay clear.
    expect(opaquePixels).toBeLessThan(16 * 16 * 0.9);
  });
});
