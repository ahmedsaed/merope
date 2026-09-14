'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';

/**
 * The nav, on a screen too narrow to hold it.
 *
 * Four items plus the wordmark and the theme control wrap onto a second line
 * below about 640px, which pushes the page down and makes the masthead look
 * broken. Below that width they collapse behind a button.
 *
 * **The breakpoint is sized to four items and has about 100px of slack at
 * `sm`.** A fifth route — and `NAV` has four with more phases to come — would
 * spend most of that, and a sixth would wrap the inline list at 640px again.
 * When that happens the fix is to move this to `md`, not to shrink the type.
 * Measure it; do not assume it still fits.
 *
 * **The button is three hairlines.** It reads as the usual menu affordance,
 * which `docs/BRAND.md` requires — no interaction may be gated behind getting
 * the metaphor — and it is drawn from the one piece of furniture this design
 * already owns. A plate is ruled; so is this.
 *
 * It is a plain disclosure, not a dialog: the panel sits under the header,
 * pushes nothing, traps nothing, and the page behind it stays usable. A
 * four-link menu does not need a focus trap, and adding one would mean taking
 * the keyboard hostage for a list you can Tab through in four presses.
 */
export function MobileNav({
  items,
}: {
  items: readonly { readonly href: string; readonly label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const button = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // A static export still navigates client-side, so the panel has to be told
  // the page changed underneath it — otherwise it stays open over the page it
  // just took you to. Adjusted during render rather than in an effect: React's
  // own guidance for resetting state when a value changes, and it covers the
  // back button as well as a tap on a link, which an onClick would not.
  const [renderedFor, setRenderedFor] = useState(pathname);
  if (pathname !== renderedFor) {
    setRenderedFor(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      // Escape must put the focus back where it came from, or a keyboard user
      // is dropped at the top of the document with no idea what happened.
      button.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        ref={button}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? 'Close menu' : 'Menu'}
        className="border-rule text-ink-faint hover:text-ink flex items-center border p-2 transition-colors duration-(--dur-fast) sm:hidden"
      >
        <svg width="17" height="17" viewBox="0 0 17 17" aria-hidden focusable="false">
          {open ? (
            <g stroke="currentColor" strokeWidth="1" strokeLinecap="round">
              <line x1="3.5" y1="3.5" x2="13.5" y2="13.5" />
              <line x1="13.5" y1="3.5" x2="3.5" y2="13.5" />
            </g>
          ) : (
            <g stroke="currentColor" strokeWidth="1" strokeLinecap="round">
              <line x1="2.5" y1="4.5" x2="14.5" y2="4.5" />
              <line x1="2.5" y1="8.5" x2="14.5" y2="8.5" />
              <line x1="2.5" y1="12.5" x2="14.5" y2="12.5" />
            </g>
          )}
        </svg>
      </button>

      {/* `hidden` rather than unmounted, so the panel keeps its id for
          aria-controls whether or not it is showing. */}
      <nav
        id={panelId}
        hidden={!open}
        aria-label="Primary"
        className="bg-surface border-rule absolute top-full right-0 left-0 z-30 mt-3 border sm:hidden"
      >
        <ul>
          {items.map((item) => (
            <li key={item.href} className="border-rule border-b last:border-b-0">
              <Link
                href={item.href}
                className="annotation hover:bg-raised hover:text-accent block px-4 py-3.5 transition-colors duration-(--dur-fast)"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
