import { PLEIADES } from '@/lib/merope';
import { placeLabels, projectCluster, radiusForMagnitude } from '@/lib/sky';
import { GLYPH_SCALE, glyphPath } from '../glyph';

/**
 * The Pleiades, at their real relative positions.
 *
 * This is the asterism from the wordmark study — rejected as the mark because it
 * collapses at favicon size, kept here where it can be large enough to work.
 *
 * Every position comes from published coordinates in `src/lib/merope.ts` and is
 * projected by `src/lib/sky.ts`; nothing is hand-placed. That constraint is the
 * point: a star chart that is only approximately the sky is just a pattern of
 * dots, and this site does not get to claim the lore and then fudge it.
 *
 * Nine stars, the nebula and the ring. The faint field behind them is not drawn
 * here — that is `SkyBackdrop`, which the whole site stands on.
 *
 * Rendered as SVG rather than canvas: nine glyphs do not need a render loop, and
 * SVG inherits the theme tokens for free.
 */

type StarFieldProps = {
  /** Rendered width in px. Height follows from the field's aspect. */
  size?: number;
  /**
   * Tightens the viewBox to what is actually drawn instead of keeping the
   * square field. The Pleiades spans about 1.0° east-west and 0.61° north-south,
   * so a square frame is a third empty — fine in a styleguide swatch, a hole in
   * a hero. Cropping changes the frame, never a position.
   */
  crop?: boolean;
  /** Rings Merope in grease pencil, the way the mark does. */
  highlight?: boolean;
  /**
   * Labels each star. Used only by `/styleguide`, which is the surface where the
   * projection gets checked — "Pleione is leftmost" has to be readable off the
   * drawing — and which is internal and noindex. On the site the names are the
   * thing that makes this read as an astronomy diagram rather than a picture of
   * the sky, so they stay off.
   */
  labelled?: boolean;
  /** The diffuse wash standing in for NGC 1435. Off for small or inline use. */
  nebula?: boolean;
  className?: string;
};

const VIEW = 100;

/** Radius of the grease-pencil ring drawn around Merope, in viewBox units. */
const RING_RADIUS = 5;

/**
 * Star size before the magnitude compression in `radiusForMagnitude`, and before
 * `GLYPH_SCALE` adjusts it for whichever glyph is active.
 *
 * Sized against the grease-pencil ring rather than in the abstract: the ring is
 * 5 units and Merope has to sit inside it as a star that was circled, not as a
 * shape that fills it.
 */
const DOT_BASE = 1.9;

/** Label type size, in viewBox units. Mirrored in the `font` shorthand below. */
const LABEL_SIZE = 3.4;

/** The nebula wash: major radius, how flat it is, and how far it is tilted. */
const NEBULA_RX = 27;
const NEBULA_FLATTEN = 0.667;
const NEBULA_TILT = -12;

export function StarField({
  size = 320,
  crop = false,
  highlight = true,
  labelled = false,
  nebula = false,
  className = '',
}: StarFieldProps) {
  const projected = projectCluster(PLEIADES);
  const merope = projected.find((p) => p.star.name === 'Merope');
  // Nine stars, three of them close pairs — label positions have to be solved,
  // not chosen. See placeLabels in sky.ts.
  const labels = labelled
    ? placeLabels(projected, {
        view: VIEW,
        dotBase: DOT_BASE,
        ring: highlight ? { name: 'Merope', radius: RING_RADIUS } : undefined,
      })
    : [];

  const frame = crop
    ? contentBounds({ projected, labels, highlight, nebula, merope })
    : { x: 0, y: 0, w: VIEW, h: VIEW };

  /**
   * SVG defs live in a global id space, and the styleguide puts several fields
   * on one page. Derived from the frame rather than a counter or `useId`:
   * StarField is pulled into the client bundle by HeroField, so the id has to
   * come out identical on the server and in the browser or hydration breaks.
   */
  const uid = `sf${[frame.x, frame.y, frame.w, frame.h].map((n) => Math.round(n * 10)).join('_')}`;

  return (
    <svg
      width={size}
      height={Math.round((size * frame.h) / frame.w)}
      // `size` is an intention, not a floor: the field must shrink inside a
      // narrow column rather than push the page sideways. The viewBox does the
      // scaling, so nothing moves relative to anything else.
      style={{ maxWidth: '100%', height: 'auto' }}
      viewBox={`${frame.x.toFixed(2)} ${frame.y.toFixed(2)} ${frame.w.toFixed(2)} ${frame.h.toFixed(2)}`}
      className={className}
      role="img"
      aria-label={`The Pleiades: ${PLEIADES.map((s) => s.name).join(', ')}. Merope highlighted.`}
      focusable="false"
    >
      {nebula && merope ? (
        <>
          <defs>
            <radialGradient id={`${uid}-nebula`}>
              <stop className="exposure" offset="0%" stopColor="var(--accent)" stopOpacity="0.26" />
              <stop
                className="exposure"
                offset="40%"
                stopColor="var(--accent)"
                stopOpacity="0.12"
              />
              <stop
                className="exposure"
                offset="72%"
                stopColor="var(--accent)"
                stopOpacity="0.04"
              />
              <stop className="exposure" offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Offset from the star, wider than it is tall, and soft to the edge:
              the nebula is dust Merope happens to be lighting, not a halo it
              emits. Centring it on the star would say the opposite. */}
          <g
            // Offset by --nebula-x/y if an ancestor sets them, which is how
            // HeroField gives the dust its slight pointer response. Unset
            // everywhere else, so the field stays a pure server-rendered SVG.
            style={{
              transform: 'translate(var(--nebula-x, 0px), var(--nebula-y, 0px))',
              transition: 'transform var(--dur-base) var(--easing-plate)',
            }}
          >
            <ellipse
              cx={merope.x * VIEW - 5}
              cy={merope.y * VIEW + 4}
              rx={NEBULA_RX}
              ry={NEBULA_RX * NEBULA_FLATTEN}
              fill={`url(#${uid}-nebula)`}
              transform={`rotate(${NEBULA_TILT} ${merope.x * VIEW - 5} ${merope.y * VIEW + 4})`}
            />
          </g>
        </>
      ) : null}

      {projected.map(({ star, x, y, brightness }) => {
        const isMerope = star.name === 'Merope';
        const r = radiusForMagnitude(star.magnitude, DOT_BASE);
        const label = labels.find((l) => l.star.name === star.name);
        const fill = isMerope ? 'var(--accent)' : 'var(--ink)';
        // Fainter stars are genuinely fainter, on the same ramp the rest of the
        // site uses for magnitude.
        const opacity = isMerope ? 1 : 0.35 + brightness * 0.55;
        return (
          <g key={star.designation}>
            <path
              className="exposure"
              d={glyphPath(x * VIEW, y * VIEW, r * GLYPH_SCALE)}
              fill={fill}
              opacity={opacity}
            />
            {label ? (
              <text
                x={label.x}
                y={label.y}
                textAnchor={label.anchor}
                className="exposure"
                fill={isMerope ? 'var(--accent)' : 'var(--ink-faint)'}
                style={{
                  font: `400 ${LABEL_SIZE}px var(--font-plex-mono), monospace`,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}
              >
                {star.name}
              </text>
            ) : null}
          </g>
        );
      })}

      {highlight && merope ? (
        <path
          className="exposure"
          d={ringPath(merope.x * VIEW, merope.y * VIEW, RING_RADIUS)}
          fill="none"
          stroke="var(--mark)"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
      ) : null}
    </svg>
  );
}

/**
 * The rectangle the drawing actually occupies, in viewBox units.
 *
 * Measured rather than assumed, because every part of it moves: the dots come
 * from the catalogue, the labels are solved around them, and the nebula is
 * offset from Merope. Anything hand-tuned here would be wrong the next time a
 * member is added — which has already happened once.
 */
function contentBounds({
  projected,
  labels,
  highlight,
  nebula,
  merope,
}: {
  projected: ReturnType<typeof projectCluster>;
  labels: ReturnType<typeof placeLabels>;
  highlight: boolean;
  nebula: boolean;
  merope?: ReturnType<typeof projectCluster>[number];
}) {
  const xs: number[] = [];
  const ys: number[] = [];
  const add = (x0: number, y0: number, x1: number, y1: number) => {
    xs.push(x0, x1);
    ys.push(y0, y1);
  };

  for (const p of projected) {
    const isRinged = highlight && p.star.name === 'Merope';
    // The star glyph reaches further than the disc it replaces, so bound by the
    // glyph. The background field is excluded on purpose: it extends past the
    // frame in every direction and is meant to be cropped by it.
    const r = isRinged ? RING_RADIUS : radiusForMagnitude(p.star.magnitude, DOT_BASE) * GLYPH_SCALE;
    add(p.x * VIEW - r, p.y * VIEW - r, p.x * VIEW + r, p.y * VIEW + r);
  }

  for (const l of labels) {
    // Matches the reserved width in placeLabels; a character either way does
    // not change a frame this size.
    const w = l.star.name.length * LABEL_SIZE * 0.72;
    const x0 = l.anchor === 'start' ? l.x : l.anchor === 'end' ? l.x - w : l.x - w / 2;
    add(x0, l.y - LABEL_SIZE * 0.85, x0 + w, l.y + LABEL_SIZE * 0.2);
  }

  if (nebula && merope) {
    const cx = merope.x * VIEW - 5;
    const cy = merope.y * VIEW + 4;
    // Half-extents of the rotated ellipse. Bounding it by its major axis in
    // both directions instead would add nine units of nothing under the
    // southernmost star, which is a visible hole in a hero.
    const t = (NEBULA_TILT * Math.PI) / 180;
    const rx = NEBULA_RX;
    const ry = NEBULA_RX * NEBULA_FLATTEN;
    const ex = Math.hypot(rx * Math.cos(t), ry * Math.sin(t));
    const ey = Math.hypot(rx * Math.sin(t), ry * Math.cos(t));
    // The gradient reaches zero opacity at the ellipse edge, so this clips
    // nothing that is actually drawn.
    add(cx - ex, cy - ey, cx + ex, cy + ey);
  }

  const margin = 1.5;
  const x = Math.min(...xs) - margin;
  const y = Math.min(...ys) - margin;
  return { x, y, w: Math.max(...xs) + margin - x, h: Math.max(...ys) + margin - y };
}

/**
 * An open, slightly irregular ring — the same hand-drawn gesture as the mark,
 * generated here so it can sit at whatever position the projection puts Merope.
 */
function ringPath(cx: number, cy: number, r: number): string {
  // Start at ~20° and sweep just under a full turn, leaving the pencil gap.
  const wobble = [1.0, 0.96, 1.04, 0.98, 1.02, 0.97];
  const steps = wobble.length;
  const start = -1.2;
  const sweep = Math.PI * 1.93;

  const point = (i: number) => {
    const angle = start + (sweep * i) / steps;
    const radius = r * wobble[i % steps];
    return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius] as const;
  };

  const [x0, y0] = point(0);
  let d = `M${x0.toFixed(2)} ${y0.toFixed(2)}`;
  for (let i = 1; i <= steps; i += 1) {
    const [x, y] = point(i);
    // Quadratic control pushed outward so each segment bows like a drawn stroke.
    const midAngle = start + (sweep * (i - 0.5)) / steps;
    const bow = r * 1.08;
    const qx = cx + Math.cos(midAngle) * bow;
    const qy = cy + Math.sin(midAngle) * bow;
    d += ` Q${qx.toFixed(2)} ${qy.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return d;
}
