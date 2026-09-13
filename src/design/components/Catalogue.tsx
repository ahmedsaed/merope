import type { Magnitude } from '@/lib/merope';
import { Annotation, MagnitudeDot } from './primitives';

/**
 * The catalogue — treatment B, the index.
 *
 * Two treatments were built with the same data and put side by side on the
 * styleguide, because this is the centrepiece of the landing page and the wrong
 * register would undo the rest of it. The dense bordered table was rejected:
 * at the handful of projects a one-person studio actually has, it reads as a
 * spreadsheet with three rows, and a spreadsheet is not what a studio sounds
 * like. This one takes its tabular quality from alignment instead of borders —
 * the name large in Newsreader, the data as mono marginalia on the same
 * baseline, a hairline between rows and nothing else.
 *
 * Decision recorded in docs/ROADMAP.md.
 *
 * Deliberately typed against its own shape rather than the content schema: this
 * file has to stay liftable into a package (see AGENTS.md, Phase 6), so it
 * knows what a row looks like and nothing about where rows come from.
 */

export type CatalogueEntry = {
  name: string;
  summary: string;
  /** Project status on the magnitude scale. Lower is brighter. */
  magnitude: Magnitude;
  kind: string;
  /** What astronomers call a telescope's first real image. */
  firstLight: Date;
  /** The live site, if there is one. The name links to it. */
  url?: string;
  repo?: string;
};

/** ISO, in UTC, so a build machine's timezone cannot shift a launch by a day. */
const iso = (date: Date) => date.toISOString().slice(0, 10);

export function Catalogue({ entries }: { entries: readonly CatalogueEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <ul className="border-rule border-t">
      {entries.map((entry) => (
        <li key={entry.name} className="border-rule border-b py-7">
          <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
            <h3 className="text-heading flex items-baseline gap-3.5 font-normal">
              {/* The dot is the status, not an ornament: its size and opacity
                  are the value, so magnitude reads before anything is read. */}
              <MagnitudeDot magnitude={entry.magnitude} size={11} />
              {entry.url ? (
                <a href={entry.url} className="hover:text-accent transition-colors">
                  {entry.name}
                </a>
              ) : (
                entry.name
              )}
            </h3>

            {/* The marginalia. Dimmed to the row's own magnitude — but only the
                data, never the prose: a mag 6 experiment should look faint at a
                glance and still be plainly readable up close. */}
            <Annotation
              className="tabular-nums"
              style={{ opacity: `var(--mag-${entry.magnitude})` }}
            >
              m{entry.magnitude} · {entry.kind} · first light {iso(entry.firstLight)}
            </Annotation>
          </div>

          <p className="text-ink-muted mt-2.5 max-w-(--measure-prose)">{entry.summary}</p>

          {entry.repo ? (
            <a
              href={entry.repo}
              className="annotation text-ink-faint hover:text-accent mt-3 inline-block transition-colors"
              rel="noreferrer"
              target="_blank"
            >
              Source
            </a>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
