import type { Metadata } from 'next';
import { Mark } from '@/design/components/Mark';
import { StarField } from '@/design/components/StarField';
import { Annotation } from '@/design/components/primitives';
import { COORDINATE_LINE, NEBULA } from '@/lib/merope';
import { SITE } from '@/lib/site';

/**
 * The Open Graph card, as a real route.
 *
 * A static export cannot generate images at request time, and rendering the
 * card from a separate template would let it drift from the design system. So
 * the card is a page built from the same components as everything else, and
 * `pnpm render:og` screenshots it to `src/app/opengraph-image.png`.
 *
 * Deliberately plate, not sky: a social feed is mostly dark developer cards,
 * and warm paper is the more distinctive thing to be in that company.
 */

export const metadata: Metadata = {
  title: 'OG card',
  robots: { index: false, follow: false },
};

/** Matches the 1.91:1 that Open Graph consumers crop to. */
export const OG_SIZE = { width: 1200, height: 630 };

export default function OgCard() {
  return (
    <div
      id="og-card"
      className="grain relative flex overflow-hidden"
      style={{ width: OG_SIZE.width, height: OG_SIZE.height }}
    >
      <div className="flex flex-1 flex-col justify-between p-16">
        <div className="flex items-center gap-4">
          <Mark size={34} />
          <Annotation tone="accent">{SITE.domain}</Annotation>
        </div>

        <div>
          <h1 className="text-[7.5rem] leading-[0.88] font-extralight tracking-tight">
            {SITE.name}
          </h1>
          <p className="text-ink-muted mt-7 max-w-[22ch] text-[1.75rem] leading-snug font-light italic">
            {NEBULA.thesis}
          </p>
        </div>

        <Annotation>{COORDINATE_LINE}</Annotation>
      </div>

      {/* Wide enough that the westernmost labels (Celaeno, Electra) keep clear of
          the card edge, and that the cluster reaches back into the middle rather
          than leaving a dead band between the type and the sky. */}
      <div className="relative flex w-[530px] shrink-0 items-center justify-center pr-6">
        <StarField size={500} nebula labelled />
      </div>
    </div>
  );
}
