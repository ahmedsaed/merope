import type { MetadataRoute } from 'next';
import { THEME_COLORS } from '@/design/theme';
import { SITE } from '@/lib/site';

/**
 * The web app manifest.
 *
 * Modest on purpose. This is a site to read, not an app to install, so
 * `display` stays `minimal-ui`: it keeps the browser's own chrome, including
 * the back button and the address bar, both of which a reader of a long note
 * actually wants. `standalone` would take them away to look like something this
 * is not.
 *
 * The icons point at stable paths rather than the hashed URLs Next emits for
 * its file conventions, because a manifest is cached by the OS and outlives any
 * one build's hashes.
 */
export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — ${SITE.tagline}`,
    short_name: SITE.name,
    description: SITE.description,
    start_url: '/',
    display: 'minimal-ui',
    // The plate, because that is the default when no preference is stored, and
    // a manifest gets one colour rather than one per scheme.
    background_color: THEME_COLORS.plate,
    theme_color: THEME_COLORS.plate,
    icons: [
      { src: '/icon.svg', type: 'image/svg+xml', sizes: 'any' },
      { src: '/apple-icon.png', type: 'image/png', sizes: '180x180', purpose: 'any' },
    ],
  };
}
