import Link from 'next/link';
import { formatDate } from '@/lib/format';
import { Annotation } from './primitives';

/**
 * Releases, set as the catalogue and the notes index are set: the headline
 * carries the weight, the version and date are marginalia on the same baseline,
 * a hairline does the dividing.
 *
 * Shared by `/changelog`, which is every project at once, and by a project
 * page, which is one project's own history. `showProject` is the only
 * difference — on a project page the name is the `<h1>` above the list, and
 * repeating it on every row would be noise.
 *
 * `body` arrives as a node rather than as markdown: rendering MDX is the
 * content layer's job, and `src/design/` may not import from it (AGENTS.md,
 * Phase 6). The page renders the body and hands the result down.
 */

export type ReleaseEntry = {
  /**
   * The URL fragment this release answers to — `peace-1-7-1`. Unique across
   * every release, so it serves as the React key as well.
   */
  anchor: string;
  /**
   * A second fragment for the same row, set on a project's newest release only
   * — `peace-latest`. The release URL worth linking to from outside the site,
   * because it does not need editing when the next version ships.
   */
  latestAnchor?: string;
  version: string;
  date: Date;
  /** Absent when the release has no sentence of its own. See `content/schema.ts`. */
  headline?: string;
  /** Needs a human to do something before upgrading. The one thing `--mark` is for. */
  breaking: boolean;
  project?: { name: string; href: string };
  body?: React.ReactNode;
};

export function ReleaseList({
  releases,
  showProject = false,
}: {
  releases: readonly ReleaseEntry[];
  showProject?: boolean;
}) {
  if (releases.length === 0) return null;

  return (
    <ul className="border-rule border-t">
      {releases.map((release) => (
        <li
          key={release.anchor}
          id={release.anchor}
          className="anchor-row border-rule border-b py-8"
        >
          {/* The rolling alias, as its own marker: an element carries one id,
              and this row has to answer to two. See `anchor.css`. */}
          {release.latestAnchor ? (
            <span id={release.latestAnchor} className="anchor-alias" aria-hidden="true" />
          ) : null}

          <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
            <h3 className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
              {showProject && release.project ? (
                <Link
                  href={release.project.href}
                  className="text-heading hover:text-accent font-normal transition-colors duration-(--dur-fast)"
                >
                  {release.project.name}
                </Link>
              ) : null}
              {/* The version is the permalink, the way a heading in a note is
                  its own. It is already `--accent`, so the only thing being a
                  link adds is the § on hover. */}
              <a
                href={`#${release.anchor}`}
                aria-label={
                  release.project
                    ? `Permalink to ${release.project.name} v${release.version}`
                    : `Permalink to v${release.version}`
                }
                className="anchor-link annotation text-accent tabular-nums"
              >
                v{release.version}
              </a>
              {/* Grease pencil, used for the one thing it means: this needs your
                  attention before you upgrade. */}
              {release.breaking ? (
                <Annotation tone="mark" className="border-mark border px-1.5 py-0.5">
                  Breaking
                </Annotation>
              ) : null}
            </h3>

            <Annotation tone="faint" className="tabular-nums">
              <time dateTime={release.date.toISOString()}>{formatDate(release.date)}</time>
            </Annotation>
          </div>

          {release.headline ? (
            <p className="text-ink-muted mt-3 max-w-(--measure-prose)">{release.headline}</p>
          ) : null}

          {release.body ? <div className="prose prose-tight mt-5">{release.body}</div> : null}
        </li>
      ))}
    </ul>
  );
}
