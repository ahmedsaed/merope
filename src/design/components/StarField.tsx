import { PLEIADES } from '@/lib/merope';
import { projectCluster, radiusForMagnitude } from '@/lib/sky';

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
 * Rendered as SVG rather than canvas: eight circles do not need a render loop,
 * and SVG inherits the theme tokens for free.
 */

type StarFieldProps = {
  /** Viewport width in px. Height follows, since the projection is square. */
  size?: number;
  /** Rings Merope in grease pencil, the way the mark does. */
  highlight?: boolean;
  /** Labels each star. For the styleguide and the hero, not for small sizes. */
  labelled?: boolean;
  /** The diffuse wash standing in for NGC 1435. Off for small or inline use. */
  nebula?: boolean;
  className?: string;
};

const VIEW = 100;

/** Radius of the grease-pencil ring drawn around Merope, in viewBox units. */
const RING_RADIUS = 8.4;

export function StarField({
  size = 320,
  highlight = true,
  labelled = false,
  nebula = false,
  className = '',
}: StarFieldProps) {
  const projected = projectCluster(PLEIADES);
  const merope = projected.find((p) => p.star.name === 'Merope');

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      className={className}
      role="img"
      aria-label={`The Pleiades: ${PLEIADES.map((s) => s.name).join(', ')}. Merope highlighted.`}
      focusable="false"
    >
      {nebula && merope ? (
        <>
          <defs>
            <radialGradient id="merope-nebula">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.26" />
              <stop offset="40%" stopColor="var(--accent)" stopOpacity="0.12" />
              <stop offset="72%" stopColor="var(--accent)" stopOpacity="0.04" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Offset from the star, wider than it is tall, and soft to the edge:
              the nebula is dust Merope happens to be lighting, not a halo it
              emits. Centring it on the star would say the opposite. */}
          <ellipse
            cx={merope.x * VIEW - 5}
            cy={merope.y * VIEW + 4}
            rx="27"
            ry="18"
            fill="url(#merope-nebula)"
            transform={`rotate(-12 ${merope.x * VIEW - 5} ${merope.y * VIEW + 4})`}
          />
        </>
      ) : null}

      {projected.map(({ star, x, y, brightness }) => {
        const isMerope = star.name === 'Merope';
        const r = radiusForMagnitude(star.magnitude, 2.6);
        return (
          <g key={star.designation}>
            <circle
              cx={x * VIEW}
              cy={y * VIEW}
              r={r}
              fill={isMerope ? 'var(--accent)' : 'var(--ink)'}
              // Fainter stars are genuinely fainter, on the same ramp the rest
              // of the site uses for magnitude.
              opacity={isMerope ? 1 : 0.35 + brightness * 0.55}
            />
            {labelled ? (
              <text
                x={x * VIEW}
                // Clear the grease-pencil ring, not just the dot — otherwise the
                // highlighted star's own label lands on top of its ring.
                y={y * VIEW - (isMerope && highlight ? RING_RADIUS + 1.4 : r) - 3.2}
                textAnchor="middle"
                fill={isMerope ? 'var(--accent)' : 'var(--ink-faint)'}
                style={{
                  font: '400 3.4px var(--font-plex-mono), monospace',
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
