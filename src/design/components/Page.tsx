import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

/**
 * The frame every route sits in: the measure, the gutters, the header and the
 * footer. One place, so three pages cannot drift apart on the thing a visitor
 * notices first.
 *
 * **One width, every route.** A shell that narrowed on reading pages did make
 * the masthead line up with the column, but it also meant the page changed
 * shape as you navigated, which is worse than the thing it fixed. A reading
 * column cannot grow past about 70 characters without costing legibility, so
 * the space beside it is not a gap to be closed — it is a margin, and the
 * margin is where `Margin` puts the lettering. See `docs/BRAND.md`, which had
 * monospace marginalia in the direction from the start.
 *
 * It deliberately does NOT impose the `screenful` rhythm. That belongs to the
 * landing page, where each block is a composed plate you arrive at; a notes
 * index is a list and a note is an argument, and forcing either into
 * viewport-sized chunks would put a fold in the middle of someone's reading.
 */
export function Page({
  children,
  /** Off on the home page itself: a link to the page you are on is a dead
   *  control that still looks live. */
  home = true,
  className = '',
}: {
  children: React.ReactNode;
  home?: boolean;
  className?: string;
}) {
  return (
    <div className="mx-auto max-w-(--measure-wide) px-6 py-10 sm:px-10">
      <SiteHeader home={home} />
      <main className={className}>{children}</main>
      <SiteFooter />
    </div>
  );
}
