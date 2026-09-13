import { FIELD } from '@/lib/field';
import { projectField } from '@/lib/sky';
import { GLYPH_SCALE, glyphPath } from '../glyph';

/**
 * The sky the whole site is set on.
 *
 * Fixed behind every page, so the site is not a page about a star field — it is
 * a page standing on one. Three degrees of the real sky around Merope, 650 stars
 * from Gaia DR3 (`src/lib/field.ts`), none of them placed by hand. That is a
 * rule and not a preference: `docs/BRAND.md` rejected the Observatory direction
 * precisely because every space-themed studio site is a near-black ground with a
 * generated particle field, and the thing that separates this from that is that
 * it is the actual sky and can be checked against the catalogue.
 *
 * It reads differently in each theme and is correct in both, which is the whole
 * conceit of `plate` and `sky`: on the plate these are dark specks on paper,
 * because a photographic plate is a negative and that is what stars look like on
 * one. On sky they are starlight. Same positions, same markup, inverted by the
 * token layer alone.
 *
 * **Not in register with the hero's cluster, deliberately.** This layer spans
 * three degrees where the hero's field spans one, so the same stars are drawn at
 * about twice the size there. They are the wide plate and the detail print of
 * one object, which is how an archive actually holds a thing; nothing in the
 * design depends on them lining up, and at these sizes nothing reveals that they
 * do not.
 *
 * **It scrolls, and it ends.** Absolute rather than fixed, anchored to the top of
 * the document and masked out over its lower half, so the sky is the thing the
 * page opens on and reading surfaces are clean paper. A sky that followed you
 * down the page would put stars behind every paragraph of every note, which is
 * the point at which an aesthetic starts charging rent. The mask does it in CSS:
 * no scroll listener, nothing recomputed per frame, and it degrades to a plain
 * band of stars anywhere `mask-image` is unsupported.
 */

/**
 * Magnitude bands, brightest first.
 *
 * Banding rather than a continuous ramp is what makes this affordable: one
 * `<path>` per band and a bare `<use>` per star costs about 26KB of markup where
 * 650 individually sized and faded paths cost 120KB. It is also, conveniently,
 * how star charts have always worked — a chart's legend is a row of discrete
 * magnitude classes, not a gradient.
 *
 * `r` is the magnitude radius in the 100-unit viewBox, which `slice` scales to
 * the viewport; `GLYPH_SCALE` then adjusts it for whichever glyph is active, so
 * switching shape does not silently change how heavy this layer is. The ceiling
 * is a constraint rather than taste — if a background star renders at the size
 * of a cluster member the asterism stops reading and the page becomes wallpaper.
 */
const BANDS = [
  { upTo: 7.2, r: 0.148, alpha: 0.62 },
  { upTo: 8.2, r: 0.122, alpha: 0.46 },
  { upTo: 9.0, r: 0.1, alpha: 0.34 },
  { upTo: 9.6, r: 0.078, alpha: 0.25 },
  { upTo: 10.2, r: 0.061, alpha: 0.18 },
  { upTo: Infinity, r: 0.048, alpha: 0.13 },
];

const bandFor = (mag: number) => BANDS.findIndex((b) => mag <= b.upTo);

export function SkyBackdrop() {
  const stars = projectField(FIELD);
  const banded = BANDS.map((_, i) => stars.filter((s) => bandFor(s.mag) === i));

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[92vh] overflow-hidden"
      style={{
        // The layer as a whole is what gets tuned per theme; the stars inside it
        // only ever carry their own relative brightness.
        opacity: 'var(--sky-opacity)',
        transition: 'opacity var(--dur-exposure) var(--easing-plate)',
        // Full strength across the top, gone before the layer ends. The fade is
        // long on purpose — a short one reads as an edge, which is the one thing
        // a sky must not have.
        maskImage: 'linear-gradient(to bottom, #000 0%, #000 34%, transparent 88%)',
        WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, #000 34%, transparent 88%)',
      }}
    >
      <svg
        // `slice` fills whatever shape the viewport is and crops the rest, so the
        // field is never letterboxed and never stretched. Stars are round; a
        // non-uniform scale would be visible immediately.
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        focusable="false"
      >
        <defs>
          {BANDS.map((band, i) => (
            <path key={i} id={`sky-m${i}`} d={glyphPath(0, 0, band.r * GLYPH_SCALE)} />
          ))}
        </defs>
        <g className="exposure" fill="var(--ink)">
          {banded.map((group, i) => (
            <g key={i} opacity={BANDS[i].alpha}>
              {/* Keyed by position in a static, build-time list. Not by
                  coordinate: Gaia resolves close doubles that land on the same
                  rounded point here, and two of them do. */}
              {group.map(({ x, y }, j) => (
                <use
                  key={j}
                  href={`#sky-m${i}`}
                  x={(x * 100).toFixed(2)}
                  y={(y * 100).toFixed(2)}
                />
              ))}
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
