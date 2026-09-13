import { IBM_Plex_Mono, Newsreader } from 'next/font/google';

/**
 * Two families, no sans.
 *
 * A studio site that sets its body copy in Inter looks like every other studio
 * site. Setting prose in a serif and every label, coordinate and catalog value
 * in a mono is most of what makes this read as a printed plate rather than a
 * dashboard — before a single colour is applied.
 *
 * Newsreader: literary, optically sized, slightly bookish. The plate's prose.
 * IBM Plex Mono: technical without being a code font. The plate's margins.
 */

export const newsreader = Newsreader({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-newsreader',
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
});

export const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plex-mono',
  weight: ['400', '500'],
});

export const fontVariables = `${newsreader.variable} ${plexMono.variable}`;
