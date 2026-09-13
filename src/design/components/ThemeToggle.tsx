'use client';

import { useSyncExternalStore } from 'react';
import { resolveTheme, THEME_STORAGE_KEY, THEMES, type Theme } from '../theme';

/**
 * Not a sun and a moon.
 *
 * Early astrophotography worked on negatives: stars came out black on a bright
 * ground, and the archive people actually handled looked like the light theme.
 * So the control is framed as switching between the plate and the sky it
 * recorded, and it says so in words.
 */

/**
 * The active theme is not React state — it lives in the DOM attribute and in the
 * OS preference, either of which can change without this component doing
 * anything. Subscribing to both means the control also stays correct when the
 * system flips to dark at sunset while the page is open.
 */
function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', onChange);

  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  return () => {
    media.removeEventListener('change', onChange);
    observer.disconnect();
  };
}

/** No theme is knowable while prerendering, and guessing causes a flash. */
const serverSnapshot = (): Theme | null => null;

export function ThemeToggle({ className = '' }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, resolveTheme, serverSnapshot);

  function choose(next: Theme) {
    // Writing the attribute is what actually changes the theme; the
    // MutationObserver above then reports it back through the store.
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private browsing: the choice still applies for this page view.
    }
  }

  return (
    <div
      className={`border-rule inline-flex items-center gap-px border ${className}`}
      role="group"
      aria-label="Display mode"
    >
      {THEMES.map((value) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => choose(value)}
            aria-pressed={theme === null ? undefined : active}
            className={`annotation px-2.5 py-1 transition-colors duration-(--dur-fast) ${
              active ? 'bg-ink text-ground' : 'text-ink-faint hover:text-ink'
            }`}
          >
            {value}
          </button>
        );
      })}
    </div>
  );
}
