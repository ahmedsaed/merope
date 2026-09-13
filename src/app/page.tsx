import { ThemeToggle } from '@/design/components/ThemeToggle';
import { COORDINATE_LINE, NEBULA, STAR } from '@/lib/merope';
import { SITE } from '@/lib/site';

/**
 * Phase 0 placeholder. This is scaffolding that proves the pipeline renders,
 * the fonts load, and both themes resolve — the real landing page is Phase 2.
 */
export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-(--measure-wide) flex-col justify-between px-6 py-10 sm:px-10">
      <header className="flex items-baseline justify-between gap-4">
        <span className="annotation">
          {STAR.cluster.messier} / {STAR.designation}
        </span>
        <ThemeToggle />
      </header>

      <div className="py-20">
        <p className="annotation text-accent mb-6">Phase 0 · foundation</p>
        <h1 className="text-display leading-[0.92] font-light tracking-tight">{SITE.name}</h1>
        <p className="text-subhead text-ink-muted mt-6 max-w-(--measure-prose) italic">
          {NEBULA.thesis}
        </p>
      </div>

      <footer className="rule-hair flex flex-wrap items-center justify-between gap-3 pt-4">
        <span className="annotation">{COORDINATE_LINE}</span>
        <span className="annotation mag-5">{SITE.domain}</span>
      </footer>
    </main>
  );
}
