import { Catalogue, type CatalogueEntry } from '@/design/components/Catalogue';
import { HeroField } from '@/design/components/HeroField';
import { SiteFooter } from '@/design/components/SiteFooter';
import { SiteHeader } from '@/design/components/SiteHeader';
import { Annotation, SectionHead } from '@/design/components/primitives';
import { getProjects } from '@/lib/content/collections';
import { type Magnitude, NEBULA, STAR } from '@/lib/merope';
import { SITE, STATEMENT } from '@/lib/site';

/**
 * The home page — first assembly.
 *
 * Not a phase of its own but the point three phases meet (docs/ROADMAP.md).
 * What is here now is everything Phase 2 owns: the header, the hero, the
 * statement, the catalogue and the footer. Phase 3 inserts a recent-notes strip
 * above the footer and Phase 4 a newsletter below it; both slot in without
 * moving anything else, which is why the blocks are ordered the way they are.
 *
 * It is a complete, launchable page as it stands. The nav is empty because
 * nothing else resolves yet, not because it is unfinished.
 */
export default function Home() {
  const entries: CatalogueEntry[] = getProjects().map((project) => ({
    name: project.name,
    summary: project.summary,
    magnitude: project.magnitude as Magnitude,
    kind: project.kind,
    firstLight: project.firstLight,
    url: project.url,
    repo: project.repo,
  }));

  return (
    <div className="mx-auto max-w-(--measure-wide) px-6 py-10 sm:px-10">
      <SiteHeader home={false} />

      <main>
        {/* ------------------------------------------------------------ Hero */}
        <section className="flex flex-col items-start gap-12 py-16 md:flex-row md:items-center md:justify-between md:gap-14 lg:py-24">
          <div className="max-w-(--measure-prose)">
            <h1 className="text-display leading-[0.9] font-extralight tracking-tight">
              {SITE.name}
            </h1>
            <Annotation as="p" className="mt-5" style={{ letterSpacing: '0.3em' }}>
              {STAR.designation} · {STAR.cluster.messier} · {STAR.spectralType}
            </Annotation>
            {/* The thesis, and the reason for the name. Everything else on the
                page can be checked against it. */}
            <p className="text-subhead text-ink-muted mt-8 leading-snug italic">{NEBULA.thesis}</p>
          </div>

          <HeroField size={460} />
        </section>

        {/* ------------------------------------------------------- Statement */}
        <section className="border-rule border-t py-14">
          {/* One paragraph, not three. Set as separate blocks the sentences
              read as a list of claims; run together they read as a statement,
              which is what it is. The array stays split so each sentence can be
              checked on its own. */}
          <p className="max-w-(--measure-prose) text-lg leading-relaxed">{STATEMENT.join(' ')}</p>
        </section>

        {/* ------------------------------------------------------- Catalogue */}
        <section className="border-rule border-t pt-10">
          <SectionHead reference="01" title="The catalogue">
            Everything the studio has put its name on, brightest first. First light is the date a
            thing became usable by someone other than its author.
          </SectionHead>
          <Catalogue entries={entries} />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
