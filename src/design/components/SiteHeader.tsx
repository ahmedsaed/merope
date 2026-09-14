import Link from 'next/link';
import { liveNav } from '@/lib/site';
import { MobileNav } from './MobileNav';
import { ThemeToggle } from './ThemeToggle';
import { Wordmark } from './Wordmark';

/**
 * The header every page wears.
 *
 * It carries almost nothing on purpose, and the nav renders only routes that
 * actually resolve — see `liveNav` — so the site never ships a dead link or a
 * stub page apologising for itself. Items appear as the routes behind them do.
 *
 * Below `sm` the four items plus the wordmark and the theme control wrap onto a
 * second line, so under that width they collapse behind `MobileNav`. The theme
 * control never collapses: it is two small chips, it fits, and burying the one
 * thing on this site a visitor is most likely to want to press would be a poor
 * trade for a few pixels.
 *
 * `home` is off on the home page itself: a link to the page you are on is a
 * dead control that still looks live.
 */
export function SiteHeader({ home = true }: { home?: boolean }) {
  const nav = liveNav();

  return (
    // Positioned so the mobile panel can hang from the header's bottom edge
    // rather than from whatever happens to be positioned further up the tree.
    <header className="relative flex items-center justify-between gap-x-6">
      <Wordmark size="nav" href={home ? '/' : undefined} />

      <div className="flex items-center gap-4 sm:gap-6">
        {nav.length > 0 ? (
          <>
            <nav aria-label="Primary" className="hidden sm:block">
              <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="annotation hover:text-accent transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <MobileNav items={nav} />
          </>
        ) : null}
        <ThemeToggle />
      </div>
    </header>
  );
}
