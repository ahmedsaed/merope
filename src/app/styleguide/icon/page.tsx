import type { Metadata } from 'next';
import { Mark } from '@/design/components/Mark';

export const metadata: Metadata = {
  title: 'App icon',
  robots: { index: false, follow: false },
};

/**
 * The app icon, as a real route.
 *
 * Same reasoning as the Open Graph card: the build cannot assume a browser, so
 * the PNG is committed — but it is screenshotted from the same `Mark` every
 * other surface draws, rather than exported by hand from a drawing program and
 * left to drift. `pnpm render:og` shoots this too.
 *
 * Why a PNG at all when `icon.svg` already exists: iOS does not accept SVG for
 * a home-screen icon, and neither do most manifest consumers.
 *
 * **Full bleed and opaque.** iOS rounds the corners itself and composites a
 * transparent icon onto black, which would put a warm-paper mark on a black
 * tile and lose the plate entirely. So the ground is painted here.
 */
export const ICON_SIZE = 180;

export default function AppIcon() {
  return (
    <div
      id="app-icon"
      className="flex items-center justify-center"
      style={{
        width: ICON_SIZE,
        height: ICON_SIZE,
        // The literal plate stock, not var(--ground): this is captured with the
        // page forced to light, and an icon must not depend on which theme the
        // screenshot happened to run in.
        background: 'var(--plate-stock)',
      }}
    >
      <Mark size={112} />
    </div>
  );
}
