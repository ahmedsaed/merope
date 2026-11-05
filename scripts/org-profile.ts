/**
 * The README on github.com/merope-studio, rendered from the same sources as
 * the site.
 *
 * The organisation is a signpost, not a second home: the code lives on the
 * author's own account and the catalogue lives here. So the profile is built
 * from the catalogue rather than written beside it — a table typed by hand
 * goes stale the first time a project changes magnitude, and nothing would say
 * so. Every fact about the star comes from `merope.ts`, under the same rule as
 * every page on the site.
 *
 * Pure: no filesystem, no network. `write-org-profile.ts` is the command.
 */
import { MAGNITUDE_CLASSES, NEBULA, STAR, COORDINATE_LINE } from '../src/lib/merope';
import { SITE, STATEMENT } from '../src/lib/site';

export type ProfileProject = {
  slug: string;
  name: string;
  summary: string;
  magnitude: number;
  repo?: string;
};

/** Where the lockup lives in the organisation's `.github` repository. */
export const LOCKUP = {
  plate: './assets/lockup-plate.png',
  sky: './assets/lockup-sky.png',
} as const;

/** The GitHub topic every studio repository carries. */
export const TOPIC = 'merope';

const ORDINALS = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'] as const;

/** A pipe inside a table cell ends the cell. */
function cell(text: string): string {
  return text.replace(/\|/g, '\\|').replace(/\s*\n\s*/g, ' ');
}

/** `Flagship. Actively built…` → `flagship`. The row's own word for its class. */
function classWord(meaning: string): string {
  return meaning.split('.')[0].toLowerCase();
}

function githubPath(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?github\.com\//, '');
}

function accountOf(url: string): string {
  return githubPath(url).split('/')[0];
}

export function renderOrgProfile(projects: readonly ProfileProject[]): string {
  const author = SITE.social.github;
  const authorLogin = accountOf(author);

  const rows = projects.map((p) => {
    const page = `${SITE.url}/projects/${p.slug}`;
    const code = p.repo ? `[${cell(githubPath(p.repo))}](${p.repo})` : '—';
    return `| ${p.magnitude} | [${cell(p.name)}](${page}) | ${cell(p.summary)} | ${code} |`;
  });

  // Only the classes the scale is read on by eye; the telescopic row is for
  // what is archived, and an archived project is not on this page.
  const legend = MAGNITUDE_CLASSES.filter((c) => c.mag <= 6)
    .map((c) => `${c.mag} ${classWord(c.meaning)}`)
    .join(' · ');

  const topicSearch = `https://github.com/search?q=user%3A${authorLogin}+topic%3A${TOPIC}&type=repositories`;
  const rank = ORDINALS[STAR.rankAmongSisters - 1];

  return `<!--
  Generated from github.com/${authorLogin}/merope by \`pnpm org:profile\`.
  Edits made here are overwritten on the next run: change the catalogue there.
-->

<p>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="${LOCKUP.sky}">
    <img alt="${SITE.name} — ${STAR.designation} · ${STAR.cluster.messier}" src="${LOCKUP.plate}" width="280">
  </picture>
</p>

**${SITE.tagline}**

${STATEMENT.slice(0, 2).join(' ')} It is run by [${SITE.author.name}](${author}).

The code lives on [@${authorLogin}](${author}), and every studio repository there
carries the [\`${TOPIC}\`](${topicSearch}) topic. This organisation is the studio's
name on GitHub, not a second home for the work. The catalogue, the notes and
every release are at **[${SITE.domain}](${SITE.url})**.

### Catalogue

Measured on the scale a star's brightness is measured on: lower is brighter, and
six is the limit of what the eye can see unaided.

| m | Project | | Code |
| --- | --- | --- | --- |
${rows.join('\n')}

<sub>${legend}</sub>

### The name

${SITE.name} is one of the seven Pleiades, the sister most commonly identified as
the _Lost Pleiad_. She is not the faintest of them, whatever popular astronomy
says: at magnitude ${STAR.magnitude} she is the ${rank}-brightest of the seven. The
wisps around her, ${NEBULA.ngc}, are not what is left of the cloud the cluster
formed from. They are an unrelated cloud the cluster happens to be drifting
through, and they glow only because her light falls on them.

> ${NEBULA.thesis}

<sub><code>${COORDINATE_LINE}</code></sub>
`;
}
