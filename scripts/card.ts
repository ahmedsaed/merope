/**
 * Regenerates `objects/card/data.scad` — everything on the printed business
 * card that is data rather than layout.
 *
 *   pnpm card:data
 *
 * The card follows the site's rule: no star on it is hand-placed. The nine come
 * from `merope.ts` through the same projection the hero uses, the faint ones
 * around them from the Gaia field in `field.ts`, and the ring is the mark's own
 * path from `icon.svg`. The QR code is generated here too, so the module grid in
 * the model is the encoder's output and never a transcription of it.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import QRCode from 'qrcode';
import { FIELD } from '../src/lib/field';
import { PLEIADES } from '../src/lib/merope';
import {
  decToDegrees,
  projectionFor,
  projectPoint,
  radiusForMagnitude,
  raToHours,
} from '../src/lib/sky';

const OUT = join(__dirname, '..', 'objects', 'card', 'data.scad');

/**
 * Upper case on purpose. Scheme and host are case-insensitive, and capitals fit
 * QR's alphanumeric mode, which packs this URL into the smallest symbol (25×25)
 * at level Q — roughly a quarter of the code can be scuffed and still scan.
 */
const QR_TEXT = 'HTTPS://CONTACT.MEROPE.DEV';
const QR_LEVEL = 'Q';

/** The plate: where the cluster sits on the card, in millimetres. */
const PLATE = { cx: 28, cy: 34, width: 40 };

/** Nothing raised may come closer to the card's edge than this. */
const MARGIN = 5;

/** Dot radius at the base of the magnitude ramp. The faintest member comes out
 *  near 0.9mm — two nozzle widths across, so it prints as a dot, not a smear. */
const DOT_BASE = 1.1;

/** Background stars: as deep as still prints as a dot, and no closer to a
 *  member than its own clearance, or the two merge into one blob. */
const FIELD_LIMIT_G = 8.0;
const FIELD_RADIUS = 0.45;
const FIELD_CLEARANCE = 1.6;

const points = PLEIADES.map((star) => ({
  raHours: raToHours(star.ra),
  decDeg: decToDegrees(star.dec),
}));
const projection = projectionFor(points, { padding: 0 });

/** 0..1 field coordinates (y down) to card millimetres (y up). */
function toCard({ x, y }: { x: number; y: number }): [number, number] {
  return [PLATE.cx + (x - 0.5) * PLATE.width, PLATE.cy - (y - 0.5) * PLATE.width];
}

const stars = PLEIADES.map((star, i) => {
  const [x, y] = toCard(projectPoint(points[i], projection));
  return { name: star.name, x, y, r: radiusForMagnitude(star.magnitude, DOT_BASE) };
});

const xs = stars.map((s) => s.x);
const ys = stars.map((s) => s.y);
const bounds = {
  minX: Math.min(...xs) - 4,
  maxX: Math.max(...xs) + 4,
  minY: Math.min(...ys) - 4,
  maxY: Math.max(...ys) + 4,
};

const field = FIELD.filter(([, , mag]) => mag <= FIELD_LIMIT_G)
  .map(([ra, dec]) => toCard(projectPoint({ raHours: ra / 15, decDeg: dec }, projection)))
  .filter(
    ([x, y]) =>
      x > bounds.minX &&
      x < bounds.maxX &&
      y > bounds.minY &&
      y < bounds.maxY &&
      x - FIELD_RADIUS > MARGIN &&
      stars.every((s) => Math.hypot(s.x - x, s.y - y) > s.r + FIELD_CLEARANCE),
  )
  // A close pair prints as one smudge; keep the first, which is the brighter.
  .filter(([x, y], i, all) =>
    all.slice(0, i).every(([ox, oy]) => Math.hypot(ox - x, oy - y) > FIELD_CLEARANCE),
  );

/**
 * The ring, read from the favicon rather than copied: `tests/design.test.ts`
 * already holds `icon.svg` identical to `Mark.tsx`, so this is the mark.
 * Cubic segments are flattened here because OpenSCAD has no Bézier primitive.
 */
function ringPolyline(): [number, number][] {
  const svg = readFileSync(join(__dirname, '..', 'src', 'app', 'icon.svg'), 'utf8');
  const d = svg.match(/<path d="([^"]+)"/)?.[1];
  if (!d) throw new Error('No ring path in src/app/icon.svg');
  const nums = d.match(/-?\d+(\.\d+)?/g)!.map(Number);
  let [px, py] = nums.slice(0, 2);
  const out: [number, number][] = [[px, py]];
  for (let i = 2; i + 5 < nums.length; i += 6) {
    const [x1, y1, x2, y2, x3, y3] = nums.slice(i, i + 6);
    for (let step = 1; step <= 16; step++) {
      const t = step / 16;
      const u = 1 - t;
      out.push([
        u * u * u * px + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3,
        u * u * u * py + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3,
      ]);
    }
    [px, py] = [x3, y3];
  }
  // The mark is drawn on a 30-unit square centred at 15, y down.
  return out.map(([x, y]) => [x - 15, 15 - y]);
}

const qr = QRCode.create(QR_TEXT, { errorCorrectionLevel: QR_LEVEL });
const size = qr.modules.size;
const qrRows: string[] = [];
for (let row = 0; row < size; row++) {
  let line = '';
  for (let col = 0; col < size; col++) line += qr.modules.get(row, col) ? '1' : '0';
  qrRows.push(line);
}

const n = (v: number) => Number(v.toFixed(3));
const merope = stars.find((s) => s.name === 'Merope')!;

const scad = `// GENERATED FILE — do not edit. Run \`pnpm card:data\` to regenerate.
// Sources: src/lib/merope.ts, src/lib/field.ts, src/app/icon.svg; see scripts/card.ts.

// [name, x, y, radius] in millimetres, y up.
STARS = [
${stars.map((s) => `  ["${s.name}", ${n(s.x)}, ${n(s.y)}, ${n(s.r)}]`).join(',\n')}
];

MEROPE = [${n(merope.x)}, ${n(merope.y)}];

// Gaia DR3, G <= ${FIELD_LIMIT_G}, inside the plate.
FIELD = [
${field.map(([x, y]) => `  [${n(x)}, ${n(y)}]`).join(',\n')}
];
FIELD_RADIUS = ${FIELD_RADIUS};

// The mark's ring on its 30-unit square, centred on the origin, y up.
RING = [
${ringPolyline()
  .map(([x, y]) => `  [${n(x)}, ${n(y)}]`)
  .join(',\n')}
];

// "${QR_TEXT}", level ${QR_LEVEL}, version ${qr.version}. "1" is a dark module.
QR = [
${qrRows.map((r) => `  "${r}"`).join(',\n')}
];
`;

writeFileSync(OUT, scad);
console.log(
  `Wrote ${OUT}: ${stars.length} members, ${field.length} field stars, QR v${qr.version} (${size}×${size}).`,
);
