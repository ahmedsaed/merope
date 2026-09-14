import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Page } from '@/design/components/Page';
import { ReleaseList, type ReleaseEntry } from '@/design/components/ReleaseList';
import { Annotation, Field, MagnitudeDot } from '@/design/components/primitives';
import { getProject, getProjects, getReleasesForProject } from '@/lib/content/collections';
import { Markdown } from '@/lib/content/mdx';
import { formatDate } from '@/lib/format';
import { MAGNITUDE_CLASSES, type Magnitude } from '@/lib/merope';

/**
 * A project page.
 *
 * The catalogue row, opened out: the same four values, given room, plus the
 * project's own words and its history underneath. The magnitude is the only
 * thing here that needs explaining, so it explains itself — the row prints what
 * the number means rather than making a reader hold the scale in their head.
 */

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) return {};
  return {
    title: project.name,
    description: project.summary,
    openGraph: { type: 'website', title: project.name, description: project.summary },
  };
}

export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const project = getProject((await params).slug);
  if (!project) notFound();

  const magnitude = project.magnitude as Magnitude;
  const meaning = MAGNITUDE_CLASSES.find((m) => m.mag === magnitude);
  const releases = getReleasesForProject(project.slug);

  const entries: ReleaseEntry[] = releases.map((release) => ({
    id: release.slug,
    version: release.version,
    date: release.date,
    headline: release.headline,
    breaking: release.breaking,
    body: release.body ? <Markdown source={release.body} /> : undefined,
  }));

  return (
    <Page width="reading">
      <article className="py-14">
        <header>
          <h1 className="text-title flex flex-wrap items-baseline gap-4 leading-tight font-light">
            <MagnitudeDot magnitude={magnitude} size={14} />
            {project.name}
          </h1>

          <p className="text-subhead text-ink-muted mt-5 max-w-(--measure-prose) leading-snug italic">
            {project.summary}
          </p>

          <dl className="mt-10 max-w-(--measure-prose) space-y-3">
            <Field label="Magnitude">
              m{magnitude}
              {meaning ? <span className="text-ink-muted"> — {meaning.meaning}</span> : null}
            </Field>
            <Field label="Kind">{project.kind}</Field>
            {/* What astronomers call a telescope's first real image. */}
            <Field label="First light">{formatDate(project.firstLight)}</Field>
            {project.url ? (
              <Field label="Live">
                <a
                  href={project.url}
                  className="hover:text-accent transition-colors"
                  rel="noreferrer"
                  target="_blank"
                >
                  {project.url.replace(/^https?:\/\//, '')}
                </a>
              </Field>
            ) : null}
            {project.repo ? (
              <Field label="Source">
                <a
                  href={project.repo}
                  className="hover:text-accent transition-colors"
                  rel="noreferrer"
                  target="_blank"
                >
                  {project.repo.replace(/^https?:\/\/(www\.)?/, '')}
                </a>
              </Field>
            ) : null}
          </dl>
        </header>

        {project.body ? (
          <div className="prose mt-12">
            <Markdown source={project.body} />
          </div>
        ) : null}

        <section className="mt-16">
          <h2 className="text-heading mb-6 font-normal">Releases</h2>
          {entries.length > 0 ? (
            <ReleaseList releases={entries} />
          ) : (
            <Annotation as="p" tone="faint">
              Nothing released yet.
            </Annotation>
          )}
        </section>

        <p className="mt-14">
          <Link href="/projects" className="annotation hover:text-accent transition-colors">
            ← All projects
          </Link>
        </p>
      </article>
    </Page>
  );
}
