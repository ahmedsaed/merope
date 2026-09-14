import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Page } from '@/design/components/Page';
import { Annotation } from '@/design/components/primitives';
import { getNote, getNotes, getProject } from '@/lib/content/collections';
import { Markdown } from '@/lib/content/mdx';
import { formatDate } from '@/lib/format';

/**
 * A note.
 *
 * The first reading surface on the site, and the one the whole direction was
 * chosen for — `docs/BRAND.md` argues the plate aesthetic survives scrutiny
 * because this site's job is notes and changelogs, not feature cards. So this
 * page gets the measure and nothing else: no screenful rhythm, no star field,
 * no furniture in the margin competing with the argument.
 *
 * The header block is set as a plate caption — date and tags as margin
 * lettering above the title, the description as the standfirst below it. It is
 * the same vocabulary as the catalogue row, at the scale of a whole page.
 */

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getNotes().map((note) => ({ slug: note.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const note = getNote((await params).slug);
  if (!note) return {};
  return {
    title: note.title,
    description: note.description,
    openGraph: {
      type: 'article',
      title: note.title,
      description: note.description,
      publishedTime: note.date.toISOString(),
      modifiedTime: note.updated?.toISOString(),
    },
  };
}

export default async function NotePage({ params }: { params: Promise<Params> }) {
  const note = getNote((await params).slug);
  if (!note) notFound();

  // A note may name a project that is a draft, and drafts are absent from a
  // production build — so this can be undefined even though the content check
  // passed. Rendering the slug raw would leak an internal name onto the page.
  const project = note.project ? getProject(note.project) : undefined;

  return (
    <Page width="reading">
      <article className="py-14">
        <header className="max-w-(--measure-prose)">
          <Annotation as="p" tone="faint" className="tabular-nums">
            <time dateTime={note.date.toISOString()}>{formatDate(note.date)}</time>
            {project ? <> · {project.name}</> : null}
          </Annotation>

          <h1 className="text-title mt-4 leading-[1.08] font-light">{note.title}</h1>

          {/* The standfirst. Already written — it is the same sentence the index
              and the meta description use, so a note never needs a second one. */}
          <p className="text-subhead text-ink-muted mt-5 leading-snug italic">{note.description}</p>

          {note.updated ? (
            <Annotation as="p" tone="faint" className="mt-5 tabular-nums">
              Updated {formatDate(note.updated)}
            </Annotation>
          ) : null}
        </header>

        <div className="prose mt-12">
          <Markdown source={note.body} />
        </div>

        {note.tags.length > 0 ? (
          <footer className="border-rule mt-14 max-w-(--measure-prose) border-t pt-5">
            {/* Not links. Tag pages are not built, and a tag that looks
                clickable and is not is worse than a tag that plainly is not. */}
            <Annotation tone="faint">{note.tags.join(' · ')}</Annotation>
          </footer>
        ) : null}

        <p className="mt-14">
          <Link href="/notes" className="annotation hover:text-accent transition-colors">
            ← All notes
          </Link>
        </p>
      </article>
    </Page>
  );
}
