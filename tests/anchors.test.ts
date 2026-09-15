import { mkdtempSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  assertUniqueReleaseAnchors,
  getReleases,
  getReleasesForProject,
  latestReleaseAnchor,
  releaseAnchor,
} from '@/lib/content/collections';

/**
 * Release anchors are a URL contract.
 *
 * `#peace-1-7-1` addresses one release forever; `#peace-latest` addresses
 * whichever release is newest at build time, so it can be linked from a README
 * once and never edited again. Both are asserted against `out/` as well as
 * against the helper, because an anchor that is absent from the built HTML
 * fails silently — the browser lands at the top of the page and nothing
 * reports a thing.
 */

describe('the fragment a release is addressable by', () => {
  it('is built from project and version, not from the filename', () => {
    expect(releaseAnchor({ project: 'peace', version: '1.7.1' })).toBe('peace-1-7-1');
  });

  it('survives a version that is not three plain numbers', () => {
    expect(releaseAnchor({ project: 'peace', version: '2.0.0-rc.1' })).toBe('peace-2-0-0-rc-1');
    expect(releaseAnchor({ project: 'peace', version: 'v1.0' })).toBe('peace-v1-0');
  });

  it('never ends up with a leading or trailing hyphen', () => {
    expect(releaseAnchor({ project: 'peace', version: '1.0.' })).toBe('peace-1-0');
  });

  it('is unique across every release in the real content', () => {
    const anchors = getReleases().map(releaseAnchor);
    expect(new Set(anchors).size).toBe(anchors.length);
    expect(() => assertUniqueReleaseAnchors()).not.toThrow();
  });
});

describe('the rolling latest anchor', () => {
  it('names the project rather than a version', () => {
    expect(latestReleaseAnchor('peace')).toBe('peace-latest');
  });

  it('cannot collide with a release anchor, because a version is never "latest"', () => {
    const anchors = new Set(getReleases().map(releaseAnchor));
    for (const release of getReleases()) {
      expect(anchors.has(latestReleaseAnchor(release.project))).toBe(false);
    }
  });
});

describe('a colliding anchor fails the build', () => {
  let dir: string | undefined;
  afterEach(() => {
    if (dir) rmSync(dir, { recursive: true, force: true });
    dir = undefined;
    delete process.env.MEROPE_CONTENT_ROOT;
  });

  const write = (name: string, frontmatter: string) => {
    dir ??= mkdtempSync(join(tmpdir(), 'merope-anchors-'));
    mkdirSync(join(dir, 'changelog'), { recursive: true });
    writeFileSync(join(dir, 'changelog', name), `---\n${frontmatter}\n---\n`);
    process.env.MEROPE_CONTENT_ROOT = dir;
  };

  it('catches two files that normalise to one fragment', () => {
    // Not the same version as far as a human reading the frontmatter is
    // concerned — and the same id as far as the browser is concerned.
    write('a.md', 'project: peace\nversion: 1.7.1\ndate: 2026-09-02\nheadline: One.');
    write('b.md', 'project: peace\nversion: 1-7-1\ndate: 2026-09-03\nheadline: Two.');
    expect(() => assertUniqueReleaseAnchors()).toThrow(/#peace-1-7-1/);
  });
});

/**
 * The built export. `pnpm build` has to have run — the same contract as
 * `tests/metadata.test.ts`.
 */
const OUT = join(process.cwd(), 'out');

function built(route: string): string {
  const candidates = [join(OUT, `${route}.html`), join(OUT, route, 'index.html')];
  const file = candidates.find(existsSync);
  if (!file)
    throw new Error(`No built page for /${route} — run \`pnpm build\` before \`pnpm test\`.`);
  return readFileSync(file, 'utf8');
}

const occurrences = (html: string, id: string) => html.split(`id="${id}"`).length - 1;

describe('the built pages carry the anchors', () => {
  const releases = getReleases();
  const projects = [...new Set(releases.map((r) => r.project))];

  it.each(['changelog', ...projects.map((slug) => `projects/${slug}`)])(
    '/%s gives every release it lists an id',
    (route) => {
      const html = built(route);
      const listed = route === 'changelog' ? releases : getReleasesForProject(route.split('/')[1]);
      for (const release of listed) {
        expect(occurrences(html, releaseAnchor(release)), `#${releaseAnchor(release)}`).toBe(1);
      }
    },
  );

  it.each(projects)('%s has exactly one latest marker on the combined changelog', (slug) => {
    expect(occurrences(built('changelog'), latestReleaseAnchor(slug))).toBe(1);
  });

  it.each(projects)('%s points its latest marker at its newest release', (slug) => {
    const newest = getReleasesForProject(slug)[0];
    const html = built(`projects/${slug}`);

    expect(occurrences(html, latestReleaseAnchor(slug))).toBe(1);
    // The alias is a marker inside the row it aliases, so the row's own id has
    // to open before it — that adjacency is the whole mechanism.
    const row = html.indexOf(`id="${releaseAnchor(newest)}"`);
    const alias = html.indexOf(`id="${latestReleaseAnchor(slug)}"`);
    expect(row).toBeGreaterThan(-1);
    expect(alias).toBeGreaterThan(row);
    expect(html.slice(row, alias)).not.toContain('</li>');
  });

  it('gives the project page a stable anchor for the releases section itself', () => {
    expect(occurrences(built(`projects/${projects[0]}`), 'releases')).toBe(1);
  });

  /**
   * Every release body has a section called Added, and slugging them put eight
   * elements called `added` on `/changelog`. A duplicate id breaks no build and
   * shows nothing on the page — the browser silently resolves the fragment to
   * the first one, which was a different release.
   */
  it.each(['changelog', ...projects.map((slug) => `projects/${slug}`)])(
    '/%s has no id twice',
    (route) => {
      const ids = [...built(route).matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
      const repeated = ids.filter((id, i) => ids.indexOf(id) !== i);
      expect([...new Set(repeated)]).toEqual([]);
    },
  );
});
