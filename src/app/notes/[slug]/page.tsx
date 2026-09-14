import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Margin, MarginBlock, WithMargin } from '@/design/components/Margin';
import { Page } from '@/design/components/Page';
import { Annotation } from '@/design/components/primitives';
import { getNote, getNotes, getProject } from '@/lib/content/collections';
import { extractHeadings } from '@/lib/content/headings';
import { Markdown } from '@/lib/content/mdx';
import { formatDate } from '@/lib/format';

/**
 * A note.
 *
 * The first reading surface on the site, and the one the whole direction was
 * chosen for — `docs/BRAND.md` argues the plate aesthetic survives scrutiny
 * because this site's job is notes and changelogs, not feature cards.
 *
 * The column stops at the measure and the space beside it becomes the margin:
 * when it was written, what it belongs to, and what is in it. That is where the
 * date and the tags live, which is why the header above the prose is only the
 * title and the standfirst — the plate caption is at the edge, as it should be.
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
  const headings = extractHeadings(note.body);

  return (
    <Page>
      <article className="py-14">
        <header className="max-w-(--measure-prose)">
          <h1 className="text-title leading-[1.08] font-light">{note.title}</h1>
          {/* The standfirst. Already written — it is the same sentence the index
              and the meta description use, so a note never needs a second one. */}
          <p className="text-subhead text-ink-muted mt-5 leading-snug italic">{note.description}</p>
        </header>

        <WithMargin>
          <div className="prose mt-12 md:col-start-1 md:row-start-1">
            <Markdown source={note.body} />
          </div>

          <Margin>
            <MarginBlock label="Written">
              <Annotation as="p" className="tabular-nums">
                <time dateTime={note.date.toISOString()}>{formatDate(note.date)}</time>
              </Annotation>
              {note.updated ? (
                <Annotation as="p" tone="faint" className="mt-1 tabular-nums">
                  Updated {formatDate(note.updated)}
                </Annotation>
              ) : null}
            </MarginBlock>

            {project ? (
              <MarginBlock label="Project">
                <Link
                  href={`/projects/${project.slug}`}
                  className="annotation hover:text-accent transition-colors"
                >
                  {project.name}
                </Link>
              </MarginBlock>
            ) : null}

            {note.tags.length > 0 ? (
              <MarginBlock label="Filed under">
                {/* Not links. Tag pages are not built, and a tag that looks
                    clickable and is not is worse than one that plainly is not. */}
                <Annotation as="p" tone="faint">
                  {note.tags.join(' · ')}
                </Annotation>
              </MarginBlock>
            ) : null}

            {/* Two headings is a note with a middle, not a document that needs
                navigating. Below that the list costs more than it gives. */}
            {headings.length >= 2 ? (
              <MarginBlock label="Contents">
                <ol className="space-y-2">
                  {headings.map((heading) => (
                    <li key={heading.slug} className={heading.depth === 3 ? 'pl-3.5' : undefined}>
                      {/* Serif, not the mono the label is set in. A heading is
                          a sentence, and a sentence of any length set in
                          wide-tracked mono is work to scan — the house rule
                          puts labels and data in Plex, not prose. */}
                      <a
                        href={`#${heading.slug}`}
                        className="text-ink-muted hover:text-accent text-sm leading-snug transition-colors"
                      >
                        {heading.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </MarginBlock>
            ) : null}

            <p>
              <Link href="/notes" className="annotation hover:text-accent transition-colors">
                ← All notes
              </Link>
            </p>
          </Margin>
        </WithMargin>
      </article>
    </Page>
  );
}
