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
  width = 'wide',
  className = '',
}: {
  children: React.ReactNode;
  home?: boolean;
  /**
   * `wide` for pages built from rows that use the full measure — the catalogue,
   * the indexes, the landing page. `reading` for a page that is one column of
   * prose.
   *
   * The distinction is not cosmetic. A reading column left-aligned inside the
   * wide shell sits 175px left of centre on a 1920px screen: the header and
   * footer span the shell, the text uses 60% of it, and the page reads as
   * though it slid sideways. Centring the column costs nothing on a laptop and
   * is the whole difference on a desktop.
   */
  width?: 'wide' | 'reading';
  className?: string;
}) {
  return (
    <div className="mx-auto max-w-(--measure-wide) px-6 py-10 sm:px-10">
      {/* Header and footer keep the wide shell at every width, so navigating
          between an index and an article never moves the masthead. */}
      <SiteHeader home={home} />
      <main
        className={`${width === 'reading' ? 'mx-auto max-w-(--measure-prose)' : ''} ${className}`}
      >
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
