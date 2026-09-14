import type { Metadata } from 'next';
import { Catalogue, type CatalogueEntry } from '@/design/components/Catalogue';
import { Page } from '@/design/components/Page';
import { SectionHead } from '@/design/components/primitives';
import { getProjects } from '@/lib/content/collections';
import { type Magnitude } from '@/lib/merope';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'The studio catalogue — everything Merope has put its name on, brightest first.',
};

/**
 * The projects index.
 *
 * The same catalogue the home page carries, and deliberately the same
 * component: two renderings of one list that drifted apart would be worse than
 * either. The home page shows it as one screen among several; here it is the
 * page, with room for the scale to be explained.
 */
export default function ProjectsIndex() {
  const entries: CatalogueEntry[] = getProjects().map((project) => ({
    name: project.name,
    summary: project.summary,
    magnitude: project.magnitude as Magnitude,
    kind: project.kind,
    firstLight: project.firstLight,
    href: `/projects/${project.slug}`,
    url: project.url,
    repo: project.repo,
  }));

  return (
    <Page>
      <section className="py-14">
        <SectionHead title="Projects">
          Ordered by magnitude, which is how bright a star is and here is how alive a project is:
          lower is brighter, and six is the limit of what the eye can see unaided.
        </SectionHead>
        <div className="mt-10">
          <Catalogue entries={entries} />
        </div>
      </section>
    </Page>
  );
}
