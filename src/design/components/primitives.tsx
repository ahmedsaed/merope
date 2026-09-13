import { MAGNITUDE_CLASSES, type Magnitude } from '@/lib/merope';

/**
 * The plate furniture.
 *
 * Small, unglamorous components that carry the archive vocabulary so pages stop
 * re-deriving it. Kept in one file because none of them is big enough to earn
 * its own, and because seeing them together makes an inconsistency obvious.
 *
 * The restraint rule: hairline rules and margin lettering are the good part.
 * Registration marks, plate numbers and heavy grain are where this tips into
 * costume. Default to less.
 */

/* ------------------------------------------------------------------------ */

/**
 * Margin lettering. Small, wide, upper-case, monospaced — the way a plate was
 * annotated at its edge.
 */
export function Annotation({
  children,
  tone = 'muted',
  as: Tag = 'span',
  className = '',
}: {
  children: React.ReactNode;
  /** `mark` means *this needs attention* and is rationed. See docs/BRAND.md. */
  tone?: 'muted' | 'accent' | 'mark' | 'faint';
  as?: 'span' | 'p' | 'div' | 'dt';
  className?: string;
}) {
  const tones = {
    muted: '',
    faint: 'text-ink-faint',
    accent: 'text-accent',
    mark: 'text-mark',
  } as const;

  return <Tag className={`annotation ${tones[tone]} ${className}`}>{children}</Tag>;
}

/* ------------------------------------------------------------------------ */

/**
 * A hairline. Printed, not shadowed — a plate has no depth, so the system has
 * no elevation and rules do all the dividing.
 */
export function Rule({
  tone = 'hair',
  className = '',
}: {
  tone?: 'hair' | 'strong';
  className?: string;
}) {
  return (
    <hr
      className={`${tone === 'strong' ? 'border-rule-strong' : 'border-rule'} border-t ${className}`}
    />
  );
}

/* ------------------------------------------------------------------------ */

/**
 * A star sized and dimmed to its magnitude, used wherever a project's status
 * appears. The dot is not decoration: its size and opacity *are* the value, so
 * status reads before it is read.
 */
export function MagnitudeDot({ magnitude, size = 9 }: { magnitude: Magnitude; size?: number }) {
  const entry = MAGNITUDE_CLASSES.find((m) => m.mag === magnitude);
  // Brighter magnitudes are larger and more opaque, matching the real scale.
  const scale = 1 - (magnitude - 1) * 0.085;

  return (
    <span
      className="bg-ink inline-block shrink-0 rounded-full align-middle"
      style={{
        width: `${size * scale}px`,
        height: `${size * scale}px`,
        opacity: `var(--mag-${magnitude})`,
      }}
      role="img"
      aria-label={entry ? `Magnitude ${magnitude} — ${entry.meaning}` : `Magnitude ${magnitude}`}
    />
  );
}

/* ------------------------------------------------------------------------ */

/**
 * A labelled value, the way a catalogue prints one: mono label, plain value.
 * Used in the footer, project pages and anywhere data needs a name.
 */
export function Field({
  label,
  children,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`grid gap-1 sm:grid-cols-[minmax(6rem,9rem)_minmax(0,1fr)] sm:gap-6 ${className}`}
    >
      <Annotation as="dt" className="pt-0.5">
        {label}
      </Annotation>
      <dd className="m-0 tabular-nums">{children}</dd>
    </div>
  );
}

/* ------------------------------------------------------------------------ */

/**
 * A section opener: a catalogue reference in the margin, a title beside it.
 * The numbering is navigational, not ornamental — drop `reference` when a
 * section has no place in a sequence.
 */
export function SectionHead({
  reference,
  title,
  children,
}: {
  reference?: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-6">
      <div className="flex items-baseline gap-3">
        {reference ? <Annotation tone="accent">{reference}</Annotation> : null}
        <h2 className="text-heading font-normal">{title}</h2>
      </div>
      {children ? <p className="text-ink-muted mt-2 max-w-(--measure-prose)">{children}</p> : null}
    </header>
  );
}
