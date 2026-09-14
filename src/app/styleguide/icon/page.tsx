import type { Metadata } from 'next';
import { Mark } from '@/design/components/Mark';

export const metadata: Metadata = {
  title: 'Icons',
  robots: { index: false, follow: false },
};

/**
 * The icon files, as a real route.
 *
 * Same reasoning as the Open Graph card: the build cannot assume a browser, so
 * the files are committed — but they are screenshotted from the same `Mark`
 * every other surface draws, rather than exported once by hand and left to rot.
 * `pnpm render:og` shoots all of these.
 *
 * The `.ico` is not shot from here — it is rasterised from `icon.svg`, which is
 * transparent by construction and is the file a modern browser prefers anyway.
 * See `scripts/render-og.ts`.
 */

/** iOS home screen. Opaque and full bleed — see below. */
export const APP_ICON_SIZE = 180;

export default function Icons() {
  return (
    <div className="p-10">
      {/* iOS rounds the corners itself and composites a transparent icon onto
          black, which would put a warm-paper mark on a black tile and lose the
          plate entirely. So this one paints its ground. */}
      <div
        id="app-icon"
        className="flex items-center justify-center"
        style={{
          width: APP_ICON_SIZE,
          height: APP_ICON_SIZE,
          background: 'var(--plate-stock)',
        }}
      >
        <Mark size={112} />
      </div>
    </div>
  );
}
