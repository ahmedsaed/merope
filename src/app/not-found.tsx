import type { Metadata } from 'next';
import Link from 'next/link';
import { Page } from '@/design/components/Page';
import { Annotation } from '@/design/components/primitives';
import { liveNav } from '@/lib/site';

export const metadata: Metadata = {
  title: 'No object at these coordinates',
  robots: { index: false, follow: true },
};

/**
 * 404.
 *
 * The line is `docs/BRAND.md`'s, and it is the one place the lore is allowed to
 * carry the whole message — a person who has never heard of Merope still reads
 * "there is nothing here", and a person who has gets the joke for free.
 *
 * **Deliberately no star field.** The obvious move is to put the cluster here,
 * and it would contradict the sentence directly above it: a sky full of objects
 * under the words "no object at these coordinates". An empty plate is the
 * honest image, and an empty plate is what the backdrop already provides.
 *
 * `follow: true` with `index: false` on purpose. A 404 should never be indexed,
 * but a crawler that reaches one still ought to follow its way back out.
 */
export default function NotFound() {
  return (
    <Page>
      {/* The offset is not decoration. `screenful` alone makes this page exactly
          one header taller than the viewport, and the snap marker at the
          section's top edge then pulls the masthead off-screen the moment the
          page settles. Subtracting the header is what puts the rest position at
          the top of the document — the same reason the hero carries it. */}
      <section className="screenful py-16 [--screen-offset:var(--header-block)]">
        <div className="max-w-(--measure-prose)">
          <Annotation as="p" tone="faint">
            404
          </Annotation>

          <h1 className="text-title mt-5 leading-tight font-light">
            No object at these coordinates.
          </h1>

          <p className="text-ink-muted mt-6 text-lg leading-relaxed">
            Nothing is catalogued at this address. It may have moved, it may have been renamed, or
            it may never have been here — plates get mislabelled, and so do URLs.
          </p>

          <nav aria-label="Recovery" className="mt-10">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              <li>
                <Link href="/" className="annotation hover:text-accent transition-colors">
                  ← Home
                </Link>
              </li>
              {/* Built from the same source as the masthead, so a route that
                  does not resolve can never be offered here as a way out. */}
              {liveNav().map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="annotation text-ink-faint hover:text-accent transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>
    </Page>
  );
}
