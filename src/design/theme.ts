export const THEMES = ['plate', 'sky'] as const;
export type Theme = (typeof THEMES)[number];

export const THEME_STORAGE_KEY = 'merope.theme';

/**
 * What the control says when someone asks it.
 *
 * The toggle is two glyphs, so this is the only place the idea is spelled out —
 * and it has to do the whole job for a visitor who has never heard of Merope.
 * Kept here rather than in the component because it is copy, and because the
 * glyphs are drawn from the same premise: the plate is a negative of the sky.
 */
export const THEME_LABELS: Record<Theme, { name: string; meaning: string }> = {
  plate: {
    name: 'Plate',
    meaning:
      'The archive. A photographic plate is a negative, so stars come out dark on pale stock — this is the thing an observer actually handled.',
  },
  sky: {
    name: 'Sky',
    meaning: 'The observation itself. The same stars, the way they looked before the glass.',
  },
};

/** The line that makes the pair make sense. Shown under either explanation. */
export const THEME_PREMISE = 'Two ways of recording the same sky.';

/**
 * The console banner.
 *
 * `docs/BRAND.md` asks for the real coordinates on load, and this is the whole
 * of it: one line for anyone who opens the console, styled so it reads as a
 * plate caption rather than as log output.
 *
 * Deliberately a `log` and not a `warn`. The screenshot harness fails the build
 * on any console error, and a site that shouts at its own verification tooling
 * to make a joke has got the priorities backwards.
 */
export const CONSOLE_BANNER_SCRIPT = (line: string, thesis: string) =>
  `
(function () {
  try {
    console.log(
      "%c" + ${JSON.stringify(line)} + "%c\\n" + ${JSON.stringify(thesis)},
      "font-family:ui-monospace,monospace;letter-spacing:0.14em",
      "font-style:italic;opacity:0.7"
    );
  } catch (e) {}
})();
`.trim();

/**
 * Runs blocking, before first paint, to stop the wrong theme flashing.
 *
 * Deliberately does NOT write a default: with no stored choice the attribute
 * stays absent and the `prefers-color-scheme` block in tokens.css decides. That
 * keeps "follow the system" as a real third state rather than a fiction.
 *
 * Stringified rather than serialised from a function so it survives
 * minification with its behaviour intact.
 */
export const THEME_INIT_SCRIPT = `
(function () {
  try {
    var t = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    if (t === 'plate' || t === 'sky') {
      document.documentElement.setAttribute('data-theme', t);
    }
  } catch (e) {}
})();
`.trim();

/** Resolves what the user is actually looking at right now. */
export function resolveTheme(): Theme {
  const explicit = document.documentElement.getAttribute('data-theme');
  if (explicit === 'plate' || explicit === 'sky') return explicit;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'sky' : 'plate';
}
