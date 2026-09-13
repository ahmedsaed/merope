import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Markdown } from '@/lib/content/mdx';
import { getNote, getNotes } from '@/lib/content/collections';

/**
 * Phase 0: proves MDX, syntax highlighting and `generateStaticParams` survive a
 * static export. The typography this deserves arrives in Phase 3.
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
    openGraph: { type: 'article', publishedTime: note.date.toISOString() },
  };
}

export default async function NotePage({ params }: { params: Promise<Params> }) {
  const note = getNote((await params).slug);
  if (!note) notFound();

  return (
    <main className="mx-auto max-w-(--measure-prose) px-6 py-16">
      <p className="annotation text-ink-faint mb-4">
        <time dateTime={note.date.toISOString()}>
          {note.date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            timeZone: 'UTC',
          })}
        </time>
      </p>
      <h1 className="text-title mb-8 leading-tight font-light">{note.title}</h1>
      <article className="space-y-5 leading-relaxed">
        <Markdown source={note.body} />
      </article>
    </main>
  );
}
