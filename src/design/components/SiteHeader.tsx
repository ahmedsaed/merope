import Link from 'next/link';
import { liveNav } from '@/lib/site';
import { ThemeToggle } from './ThemeToggle';
import { Wordmark } from './Wordmark';

/**
 * The header every page wears.
 *
 * It carries almost nothing on purpose. A studio with three projects does not
 * need a navigation bar, and the nav here renders only routes that actually
 * resolve — see `liveNav` — so in Phase 2 it is the signature and the toggle
 * and nothing else. Items appear as the routes behind them do.
 *
 * `home` is off on the home page itself: a link to the page you are on is a
 * dead control that still looks live.
 */
export function SiteHeader({ home = true }: { home?: boolean }) {
  const nav = liveNav();

  return (
    <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
      <Wordmark size="nav" href={home ? '/' : undefined} />

      <div className="flex items-center gap-6">
        {nav.length > 0 ? (
          <nav aria-label="Primary">
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="annotation hover:text-accent transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
        <ThemeToggle />
      </div>
    </header>
  );
}
