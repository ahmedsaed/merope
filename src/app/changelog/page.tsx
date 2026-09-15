import type { Metadata } from 'next';
import { Page } from '@/design/components/Page';
import { ReleaseList, type ReleaseEntry } from '@/design/components/ReleaseList';
import { Annotation, SectionHead } from '@/design/components/primitives';
import {
  getProject,
  getReleases,
  latestReleaseAnchor,
  releaseAnchor,
} from '@/lib/content/collections';
import { Markdown } from '@/lib/content/mdx';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Changelog',
  description: 'Every release across every project in the studio, newest first.',
  path: '/changelog',
});

/**
 * The combined changelog.
 *
 * One list across every project, because a studio of this size has one history
 * and splitting it by project would mean four pages with two entries each. The
 * per-project view is the project page, which is the same component with the
 * name turned off.
 */
export default function ChangelogIndex() {
  const releases = getReleases();

  // The list is newest-first across every project at once, so the first row a
  // project has here is its newest — and the only one that may carry the
  // rolling `<project>-latest` alias.
  const dated = new Set<string>();

  const years = releases.reduce<Map<number, ReleaseEntry[]>>((acc, release) => {
    const project = getProject(release.project);
    const entry: ReleaseEntry = {
      anchor: releaseAnchor(release),
      latestAnchor: dated.has(release.project) ? undefined : latestReleaseAnchor(release.project),
      version: release.version,
      date: release.date,
      headline: release.headline,
      breaking: release.breaking,
      // A release may name a project that is a draft, and drafts are absent
      // from a production build. Better no link than a dead one.
      project: project ? { name: project.name, href: `/projects/${project.slug}` } : undefined,
      body: release.body ? <Markdown source={release.body} anchors={false} /> : undefined,
    };
    dated.add(release.project);

    const year = release.date.getUTCFullYear();
    acc.set(year, [...(acc.get(year) ?? []), entry]);
    return acc;
  }, new Map());

  return (
    <Page>
      <section className="py-14">
        <SectionHead title="Changelog">
          Every release the studio has shipped, newest first. Anything marked in grease pencil needs
          a decision from you before you upgrade.
        </SectionHead>

        {releases.length === 0 ? (
          <Annotation as="p" tone="faint">
            Nothing released yet.
          </Annotation>
        ) : (
          <div className="mt-12 space-y-14">
            {[...years.entries()].map(([year, yearReleases]) => (
              <section key={year}>
                <Annotation as="p" tone="faint" className="mb-1">
                  {year}
                </Annotation>
                <ReleaseList releases={yearReleases} showProject />
              </section>
            ))}
          </div>
        )}
      </section>
    </Page>
  );
}
