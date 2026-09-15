import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Margin, MarginBlock, WithMargin } from '@/design/components/Margin';
import { Page } from '@/design/components/Page';
import { ReleaseList, type ReleaseEntry } from '@/design/components/ReleaseList';
import { Annotation, MagnitudeDot } from '@/design/components/primitives';
import { getProject, getProjects, getReleasesForProject } from '@/lib/content/collections';
import { Markdown } from '@/lib/content/mdx';
import { formatDate } from '@/lib/format';
import { pageMetadata } from '@/lib/seo';
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
  return pageMetadata({
    title: project.name,
    description: project.summary,
    path: `/projects/${project.slug}`,
  });
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
    <Page>
      <article className="py-14">
        <header className="max-w-(--measure-prose)">
          <h1 className="text-title flex flex-wrap items-baseline gap-4 leading-tight font-light">
            <MagnitudeDot magnitude={magnitude} size={14} />
            {project.name}
          </h1>

          <p className="text-subhead text-ink-muted mt-5 leading-snug italic">{project.summary}</p>
        </header>

        <WithMargin>
          <div className="md:col-start-1 md:row-start-1">
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
          </div>

          {/* The catalogue values, in the margin where a plate keeps its
              lettering, rather than as a block the reader has to get past to
              reach the project's own words. */}
          <Margin>
            <MarginBlock label="Magnitude">
              <Annotation as="p" className="text-ink">
                m{magnitude}
              </Annotation>
              {meaning ? (
                <p className="text-ink-muted mt-1.5 text-sm leading-snug">{meaning.meaning}</p>
              ) : null}
            </MarginBlock>

            <MarginBlock label="Kind">
              <Annotation as="p">{project.kind}</Annotation>
            </MarginBlock>

            {/* What astronomers call a telescope's first real image. */}
            <MarginBlock label="First light">
              <Annotation as="p" className="tabular-nums">
                <time dateTime={project.firstLight.toISOString()}>
                  {formatDate(project.firstLight)}
                </time>
              </Annotation>
            </MarginBlock>

            {project.url || project.repo ? (
              <MarginBlock label="Elsewhere">
                {/* `wrap-anywhere`, because a URL has no spaces to break at and
                    the margin is a full-width column on a phone. Peace's
                    releases link is 41 characters and took the document 2px
                    past the viewport at 390px — a horizontal scrollbar earned
                    by one path segment. */}
                <ul className="space-y-1.5 wrap-anywhere">
                  {project.url ? (
                    <li>
                      <a
                        href={project.url}
                        className="annotation hover:text-accent transition-colors"
                        rel="noreferrer"
                        target="_blank"
                      >
                        {project.url.replace(/^https?:\/\//, '')}
                      </a>
                    </li>
                  ) : null}
                  {project.repo ? (
                    <li>
                      <a
                        href={project.repo}
                        className="annotation hover:text-accent transition-colors"
                        rel="noreferrer"
                        target="_blank"
                      >
                        {project.repo.replace(/^https?:\/\/(www\.)?/, '')}
                      </a>
                    </li>
                  ) : null}
                </ul>
              </MarginBlock>
            ) : null}

            <p>
              <Link href="/projects" className="annotation hover:text-accent transition-colors">
                ← All projects
              </Link>
            </p>
          </Margin>
        </WithMargin>
      </article>
    </Page>
  );
}
