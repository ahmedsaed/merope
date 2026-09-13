/**
 * Regenerates `src/lib/field.ts` — the faint background stars behind the hero.
 *
 * Run it when the field needs to go deeper or wider:
 *
 *   pnpm fetch:field
 *
 * Why a script and a committed file rather than a fetch at build time: the build
 * cannot assume a network, exactly as it cannot assume a browser for the OG card.
 * Why a query rather than a hand-written list: `AGENTS.md` says star positions
 * are never hand-placed, and a background of invented dots is the particle
 * starfield `docs/BRAND.md` rejected the Observatory direction for. These are
 * the real stars in the real patch of sky around Merope, and the query that
 * produced them is printed at the top of the generated file so anyone can run it
 * again and get the same answer.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PLEIADES } from '../src/lib/merope';
import { decToDegrees, raToHours } from '../src/lib/sky';

/**
 * Gaia DR3 via VizieR. Centred on the cluster, and wide enough to fill a page
 * rather than a frame: the field is the site's background, not something drawn
 * behind the nine. Three degrees covers a desktop viewport with room to crop.
 *
 * The magnitude cut is set by markup weight, not by astronomy. Every star here
 * is an SVG element, so the limit is "as deep as looks like sky and no deeper".
 */
const CENTRE = { ra: '03 47 00', dec: '+24 07 00' };
const RADIUS_ARCMIN = 180;
const LIMIT_G = 11.2;
const MAX_STARS = 650;

const QUERY =
  'https://vizier.cds.unistra.fr/viz-bin/asu-tsv' +
  '?-source=I/355/gaiadr3' +
  `&-c=${encodeURIComponent(`${CENTRE.ra} ${CENTRE.dec}`)}` +
  `&-c.rm=${RADIUS_ARCMIN}` +
  '&-out=RA_ICRS,DE_ICRS,Gmag' +
  `&-out.max=${MAX_STARS + 50}` +
  '&-sort=Gmag' +
  `&Gmag=${encodeURIComponent(`<${LIMIT_G}`)}`;

/**
 * Anything this close to a catalogued member is that member. The nine are drawn
 * from `merope.ts`; drawing them twice would put a faint dot under every bright
 * one and quietly double the brightest star in the frame.
 */
const DEDUP_ARCSEC = 20;

async function main() {
  const response = await fetch(QUERY);
  if (!response.ok) throw new Error(`VizieR returned ${response.status}`);
  const body = await response.text();

  const rows = body
    .split('\n')
    .filter((line) => /^\s*\d/.test(line))
    .map((line) => line.split('\t').map((cell) => cell.trim()))
    .filter((cells) => cells.length >= 3 && cells.every(Boolean))
    .map(([ra, dec, mag]) => ({ ra: Number(ra), dec: Number(dec), mag: Number(mag) }))
    .filter((s) => Number.isFinite(s.ra) && Number.isFinite(s.dec) && Number.isFinite(s.mag));

  if (rows.length === 0) throw new Error('VizieR returned no usable rows');

  const members = PLEIADES.map((s) => ({
    ra: raToHours(s.ra) * 15,
    dec: decToDegrees(s.dec),
  }));

  const cosDec = Math.cos((decToDegrees(PLEIADES[0].dec) * Math.PI) / 180);
  const tolerance = DEDUP_ARCSEC / 3600;

  const field = rows
    .filter(
      (star) =>
        !members.some((m) => Math.hypot((star.ra - m.ra) * cosDec, star.dec - m.dec) < tolerance),
    )
    // Brightest first from VizieR, so this keeps the stars an eye would keep.
    .slice(0, MAX_STARS);

  const magnitudes = field.map((s) => s.mag);
  const file = `/**
 * GENERATED FILE — do not edit. Run \`pnpm fetch:field\` to regenerate.
 *
 * The sky the whole site sits on: the ${MAX_STARS} brightest stars Gaia DR3 records
 * within ${RADIUS_ARCMIN}' (${(RADIUS_ARCMIN / 60).toFixed(0)}°) of the Pleiades down to G ${LIMIT_G}, minus the nine
 * members that \`merope.ts\` already carries and draws itself. This is the real
 * sky around Merope, not a scatter — see scripts/fetch-field.ts for why that
 * distinction is a rule here and not a preference.
 *
 * Source, verbatim:
 * ${QUERY}
 *
 * Retrieved ${new Date().toISOString().slice(0, 10)}. ${field.length} stars, G ${Math.min(...magnitudes).toFixed(2)}–${Math.max(...magnitudes).toFixed(2)}.
 *
 * Degrees rather than sexagesimal, because nothing here is quoted in the UI —
 * these are positions to draw, not facts to state. Rounded to 5dp, which is
 * 0.04" and some three orders of magnitude finer than a pixel in this frame.
 */

/** \`[right ascension, declination, G magnitude]\`, all in degrees except the last. */
export type FieldStar = readonly [ra: number, dec: number, mag: number];

export const FIELD: readonly FieldStar[] = [
${field.map((s) => `  [${s.ra.toFixed(5)}, ${s.dec.toFixed(5)}, ${s.mag.toFixed(2)}],`).join('\n')}
];
`;

  const out = join(process.cwd(), 'src/lib/field.ts');
  writeFileSync(out, file);
  console.log(
    `field → src/lib/field.ts (${field.length} stars of ${rows.length} returned, G ${Math.min(...magnitudes).toFixed(2)}–${Math.max(...magnitudes).toFixed(2)})`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
