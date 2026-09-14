import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
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
        {/*
          A raw, synchronous, inline script, and it has to stay one.

          React logs a dev-only warning about script tags inside components —
          "scripts inside React components are never executed when rendering on
          the client" — which is true and, for this script, irrelevant: it must
          run once, before the first paint, and never again. The warning does
          not appear in a production build.

          `next/script` with `strategy="beforeInteractive"` is the documented
          way to silence it and it is wrong here. Under `output: 'export'` it
          does not emit an executable tag at all; it pushes the source into
          `self.__next_s` for the framework runtime to drain after boot, so the
          theme lands after the page has already painted in the other one. The
          entire e2e suite stayed green through that change, which is why
          "sets the theme with the framework JavaScript blocked" now exists.
        */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        {/* Nothing depends on this, so it must never be in the way of paint. */}
        <Script
          id="merope-banner"
          strategy="afterInteractive"
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
