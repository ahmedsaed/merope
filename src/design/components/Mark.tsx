/**
 * The Merope mark: a star, circled in grease pencil.
 *
 * The gesture an astronomer made on a photographic plate to say *this one*. It
 * is the studio thesis as a drawing — the object, and the act of picking it out.
 *
 * Two deliberate properties:
 *
 * - The ring is drawn as an open arc, not a circle. A closed `<circle>` reads as
 *   geometry; the gap and the slightly-off radii read as a hand holding a pencil.
 * - It survives 16px. That is the whole reason this won over the asterism, which
 *   is more meaningful and collapses into noise at favicon size.
 *
 * Subdomains inherit the ring and change what sits inside it.
 */

type MarkProps = {
  /** Rendered size in pixels. The stroke compensates so the ring stays visible. */
  size?: number;
  /** Decorative marks sit inside a labelled wordmark and should stay unannounced. */
  title?: string;
  className?: string;
};

/**
 * The ring thickens as the mark shrinks. At 16px a hairline disappears into the
 * pixel grid, and at 96px that same relative weight looks like a crayon.
 */
function ringStroke(size: number): number {
  if (size <= 18) return 3;
  if (size <= 32) return 2.4;
  if (size <= 64) return 1.9;
  return 1.6;
}

/** The star shrinks slightly at large sizes so the ring keeps room to breathe. */
function starRadius(size: number): number {
  if (size <= 18) return 6;
  if (size <= 32) return 5.4;
  return 4.6;
}

export function Mark({ size = 24, title, className }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 30 30"
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <circle cx="15" cy="15" r={starRadius(size)} fill="var(--accent)" />
      {/* Open at roughly one o'clock, radii varying by a few tenths: a ring
          somebody drew, not one a compass drew. */}
      <path
        d="M15 3.2 C21.8 3.0 27.2 8.2 27.0 15.1 C26.8 21.9 21.6 27.1 14.8 26.9 C8.0 26.7 2.9 21.4 3.1 14.6 C3.3 8.2 8.3 3.4 14.6 3.2"
        fill="none"
        stroke="var(--mark)"
        strokeWidth={ringStroke(size)}
        strokeLinecap="round"
      />
    </svg>
  );
}
