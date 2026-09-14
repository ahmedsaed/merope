import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

/**
 * The frame every route sits in: the measure, the gutters, the header and the
 * footer. One place, so three pages cannot drift apart on the thing a visitor
 * notices first.
 *
 * It deliberately does NOT impose the `screenful` rhythm. That belongs to the
 * landing page, where each block is a composed plate you arrive at; a notes
 * index is a list and a note is an argument, and forcing either into
 * viewport-sized chunks would put a fold in the middle of someone's reading.
 * `docs/BRAND.md` is explicit that this is a reading aesthetic before it is a
 * visual one.
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
