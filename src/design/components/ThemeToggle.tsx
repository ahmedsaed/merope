'use client';

import { useSyncExternalStore } from 'react';
import { PLEIADES } from '@/lib/merope';
import { projectCluster } from '@/lib/sky';
import { glyphPath } from '../glyph';
import { resolveTheme, THEME_LABELS, THEME_PREMISE, THEME_STORAGE_KEY, THEMES } from '../theme';

/**
 * Not a sun and a moon.
 *
 * Early astrophotography worked on negatives: stars came out black on a bright
 * ground, and the archive people actually handled looked like the light theme.
 * So the control is not "light and dark" — it is the plate and the sky it
 * recorded, and the two glyphs are a positive and a negative of the same three
 * stars. That is the whole idea, drawn rather than described.
 *
 * The words moved into the tooltip. Two glyphs read as a control at a glance
 * where `plate / sky` read as jargon, but a glyph alone tells a first-time
 * visitor nothing, so hovering or focusing either one explains the premise.
 * Everything the tooltip says lives in `../theme.ts`; this file only draws.
 *
 * **The tooltip is an explanation, never the only affordance.** Both buttons
 * carry a real accessible name, so the control is fully usable by anyone who
 * never sees the tooltip at all — which includes every touch device, since
 * there is no hover there to trigger it.
 */

/* ------------------------------------------------------------------------ */

type Theme = (typeof THEMES)[number];

const ICON = 17;

/**
 * Three real stars, because no star on this site is placed by hand — not even
 * in a 17px icon (see AGENTS.md). Alcyone, Maia and Merope are the three that
 * make a legible triangle at this size; the collinear ones would draw a dash.
 */
const ICON_STARS = projectCluster(
  PLEIADES.filter((s) => ['Alcyone', 'Maia', 'Merope'].includes(s.name)),
  { padding: 0.28 },
).map(({ x, y }) => ({ x: x * ICON, y: y * ICON }));

const STAR_R = 1.75;
const starsPath = ICON_STARS.map((s) => glyphPath(s.x, s.y, STAR_R)).join('');

/**
 * Each glyph is a chip of the theme it selects — the same three stars, once as
 * a negative and once as a positive.
 *
 * **The colours are fixed and do not follow the active theme.** They cannot:
 * the plate chip has to look like a plate while you are looking at the sky, or
 * the control is describing the wrong thing. So these read `--plate-*` and
 * `--sky-*` from tokens.css, which are the two palettes named once and are the
 * same values the themes themselves resolve from. Using `currentColor` here is
 * the obvious thing and it is wrong — it made both chips light in `sky`, so the
 * negative/positive pair collapsed into "outline icon, filled icon".
 *
 * The 1px inset on the frame is the plate's own edge, which is also what keeps
 * the pale chip visible on pale stock.
 */
function ThemeGlyph({ theme }: { theme: Theme }) {
  const plate = theme === 'plate';
  return (
    <svg
      width={ICON}
      height={ICON}
      viewBox={`0 0 ${ICON} ${ICON}`}
      aria-hidden
      focusable="false"
      className="shrink-0"
    >
      <rect
        x="0.5"
        y="0.5"
        width={ICON - 1}
        height={ICON - 1}
        rx="0.5"
        fill={plate ? 'var(--plate-stock)' : 'var(--sky-void)'}
        stroke={plate ? 'var(--plate-carbon)' : 'var(--sky-starlight)'}
        strokeOpacity="0.35"
      />
      <path d={starsPath} fill={plate ? 'var(--plate-carbon)' : 'var(--sky-starlight)'} />
    </svg>
  );
}

/* ------------------------------------------------------------------------ */

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
      className={`border-rule relative inline-flex items-center gap-px border ${className}`}
      role="group"
      aria-label="Display mode"
    >
      {THEMES.map((value) => {
        const active = theme === value;
        const label = THEME_LABELS[value];
        return (
          <span key={value} className="inline-flex">
            <button
              type="button"
              onClick={() => choose(value)}
              aria-pressed={theme === null ? undefined : active}
              aria-label={`${label.name} — ${label.meaning}`}
              aria-describedby={`theme-tip-${value}`}
              // Selection is the well behind the chip, and nothing else. It
              // cannot be an inversion, which would repaint the chip and make it
              // describe the wrong theme — and it cannot be opacity either:
              // dimming the plate chip turns its pale stock grey, which is the
              // one thing it must not look like.
              //
              // `--ink` rather than `--raised`, which was too quiet to read at
              // 17px. It works in both themes for the same reason the chips do:
              // whichever chip is selected, ink is its opposite, so the well
              // always frames it. `aria-pressed` carries the state for anyone
              // not reading pixels.
              className={`peer flex items-center p-2 transition-colors duration-(--dur-fast) ${
                active ? 'bg-ink' : 'hover:bg-raised'
              }`}
            >
              <ThemeGlyph theme={value} />
            </button>

            {/* `peer-*` off the button rather than `group-*` off a wrapper,
                because the trigger has to be `:focus-visible` and not
                `:focus-within`. A wrapper stays focus-within after a mouse
                click, which pinned the tooltip open until you clicked
                somewhere else; `:focus-visible` is the keyboard user only,
                which is exactly who needs it.

                Right-aligned to the control rather than centred on the button:
                this sits in the top-right corner of every page, so a centred
                tooltip would hang off the viewport at phone width. */}
            <span
              role="tooltip"
              id={`theme-tip-${value}`}
              className="bg-surface border-rule text-ink-muted pointer-events-none absolute top-full right-0 z-20 mt-2 w-60 border p-3 text-sm leading-snug opacity-0 transition-opacity duration-(--dur-base) peer-hover:opacity-100 peer-focus-visible:opacity-100"
            >
              <span className="annotation text-ink block">{label.name}</span>
              <span className="mt-1.5 block">{label.meaning}</span>
              <span className="text-ink-faint mt-2 block italic">{THEME_PREMISE}</span>
            </span>
          </span>
        );
      })}
    </div>
  );
}
