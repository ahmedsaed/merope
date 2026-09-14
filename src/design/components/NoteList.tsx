import Link from 'next/link';
import { formatDate } from '@/lib/format';
import { Annotation } from './primitives';

/**
 * A list of notes, set the way the catalogue is set: the title carries the
 * weight, the date is marginalia on the same baseline, and a hairline does the
 * dividing. The tabular quality comes from alignment, not from borders.
 *
 * Shared by the notes index and the home page's recent strip, because those two
 * are the same object at two lengths and had no business being written twice.
 *
 * Typed against its own shape rather than the content schema: this file has to
 * stay liftable into a package (AGENTS.md, Phase 6), so it knows what a row
 * looks like and nothing about where rows come from.
 */

export type NoteSummary = {
  slug: string;
  title: string;
  description: string;
  date: Date;
};

export function NoteList({ notes }: { notes: readonly NoteSummary[] }) {
  if (notes.length === 0) return null;

  return (
    <ul>
      {notes.map((note) => (
        <li key={note.slug} className="border-rule border-b">
          {/* The whole row is the target. A title-only link makes a precise
              click the price of reading. */}
          <Link
            href={`/notes/${note.slug}`}
            className="hover:bg-surface group block py-7 transition-colors duration-(--dur-fast)"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
              <h3 className="text-heading group-hover:text-accent font-normal transition-colors duration-(--dur-fast)">
                {note.title}
              </h3>
              <Annotation tone="faint" className="tabular-nums">
                <time dateTime={note.date.toISOString()}>{formatDate(note.date)}</time>
              </Annotation>
            </div>
            <p className="text-ink-muted mt-2.5 max-w-(--measure-prose)">{note.description}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
