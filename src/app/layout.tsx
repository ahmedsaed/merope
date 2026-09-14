import type { Metadata, Viewport } from 'next';
import { SkyBackdrop } from '@/design/components/SkyBackdrop';
import { fontVariables } from '@/design/fonts';
import { CONSOLE_BANNER_SCRIPT, THEME_INIT_SCRIPT } from '@/design/theme';
import { COORDINATE_LINE, NEBULA } from '@/lib/merope';
import { SITE } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    url: SITE.url,
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  // One entry per theme so the browser chrome matches the plate it is framing.
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f3ed' },
    { media: '(prefers-color-scheme: dark)', color: '#090e17' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={SITE.locale} className={fontVariables} suppressHydrationWarning>
      <head>
        {/* Blocking on purpose: a theme flash is worse than a millisecond. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        {/* Not blocking, and after the theme: nothing about the page depends on
            it, so it must never be in the way of first paint. */}
        <script
          async
          dangerouslySetInnerHTML={{
            __html: CONSOLE_BANNER_SCRIPT(COORDINATE_LINE, NEBULA.thesis),
          }}
        />
      </head>
      <body className="grain min-h-dvh">
        {/* Behind everything, on every route. The site stands on a sky rather
            than illustrating one — see SkyBackdrop. */}
        <SkyBackdrop />
        {children}
      </body>
    </html>
  );
}
