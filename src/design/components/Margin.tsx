import { Annotation } from './primitives';

/**
 * The margin.
 *
 * A reading column stops at about 70 characters, so on any screen wider than a
 * laptop there is room beside it that cannot be filled with more text. That
 * space is not a gap to be closed — on a plate it is where the observer wrote,
 * and `docs/BRAND.md` had monospace marginalia in the direction from the start.
 * So it carries what you would otherwise have to interrupt the prose to say:
 * when the thing was written, what it belongs to, and what is in it.
 *
 * Two rules it follows:
 *
 *  - **Nothing here is load-bearing.** Every fact in the margin is either
 *    repeated in the page's own metadata or is pure navigation. A reader on a
 *    phone never sees it laid out as a margin at all — it stacks above the
 *    prose — and loses nothing.
 *  - **It sticks, but it never scrolls itself.** A contents list that is taller
 *    than the viewport would need its own scrollbar, which is a worse thing to
 *    put on a page than a long margin. Notes with that many headings want
 *    shorter sections, not a nested widget.
 */
export function Margin({ children }: { children: React.ReactNode }) {
  return (
    <aside className="row-start-1 mt-10 space-y-8 md:sticky md:top-10 md:col-start-2 md:mt-0 md:self-start">
      {children}
    </aside>
  );
}

/** A labelled block in the margin: mono label, then whatever it is labelling. */
export function MarginBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Annotation tone="faint" as="p" className="border-rule mb-2.5 border-b pb-2">
        {label}
      </Annotation>
      {children}
    </div>
  );
}

/**
 * The grid a page uses when it has a margin: the measure, then whatever is
 * left. `minmax(0, …)` on the first column so a code block or a long URL inside
 * the prose cannot push the column past its measure.
 *
 * `grid-cols-1` on the single-column case is load-bearing, not tidiness. An
 * implicit grid column is sized `auto`, which resolves to max-content — so the
 * prose, which carries `max-width: var(--measure-prose)`, asked for 608px
 * inside a 375px phone and took the page with it. `grid-cols-1` is
 * `repeat(1, minmax(0, 1fr))`, which clamps.
 */
export function WithMargin({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-[minmax(0,var(--measure-prose))_1fr]">
      {children}
    </div>
  );
}
