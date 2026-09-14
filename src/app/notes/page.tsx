import type { Metadata } from 'next';
import { NoteList } from '@/design/components/NoteList';
import { Page } from '@/design/components/Page';
import { Annotation, SectionHead } from '@/design/components/primitives';
import { getNotes } from '@/lib/content/collections';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Notes',
  description: 'Writing from the studio — on what gets built here, and how.',
  path: '/notes',
});

/**
 * The notes index.
 *
 * Set as the catalogue is set, and for the same reason: the tabular quality
 * comes from alignment rather than from borders, so a list of five reads as a
 * considered index instead of a table with five rows. The date is marginalia —
 * it is how you find a note again, not what the note is about.
 *
 * Grouped by year, because the only navigation a small archive needs is a sense
 * of when. The heading is the year and nothing else; `SectionHead` would put a
 * catalogue reference beside it, which is furniture this page has not earned.
 */
export default function NotesIndex() {
  const notes = getNotes();

  // Newest first is already guaranteed by the loader; this only groups.
  const years = notes.reduce<Map<number, typeof notes>>((acc, note) => {
    const year = note.date.getUTCFullYear();
    acc.set(year, [...(acc.get(year) ?? []), note]);
    return acc;
  }, new Map());

  return (
    <Page>
      <section className="py-14">
        <SectionHead title="Notes">
          Writing from the studio: what gets built here, what it is made of, and the parts that
          turned out to be wrong.
        </SectionHead>

        {notes.length === 0 ? (
          <Annotation as="p" tone="faint">
            Nothing written yet.
          </Annotation>
        ) : (
          <div className="mt-12 space-y-14">
            {[...years.entries()].map(([year, yearNotes]) => (
              <section key={year}>
                <Annotation as="p" tone="faint" className="border-rule border-b pb-2">
                  {year}
                </Annotation>

                <NoteList notes={yearNotes} />
              </section>
            ))}
          </div>
        )}
      </section>
    </Page>
  );
}
