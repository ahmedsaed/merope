export const THEMES = ['plate', 'sky'] as const;
export type Theme = (typeof THEMES)[number];

export const THEME_STORAGE_KEY = 'merope.theme';

export const THEME_LABELS: Record<Theme, { name: string; meaning: string }> = {
  plate: { name: 'Plate', meaning: 'The photographic plate. What the observer wrote down.' },
  sky: { name: 'Sky', meaning: 'The observation. What was actually up there.' },
};

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
