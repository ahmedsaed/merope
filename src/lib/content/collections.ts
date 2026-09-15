import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import matter from 'gray-matter';
import type { z } from 'zod';
import {
  noteSchema,
  projectSchema,
  releaseSchema,
  type Entry,
  type Note,
  type Project,
  type Release,
} from './schema';

/**
 * Filesystem content layer.
 *
 * Deliberately hand-rolled rather than pulled from a library. It is ~100 lines,
 * it runs only at build time, and it has no upgrade path to worry about — which
 * matters more than the convenience, given how many content layers for Next
 * have been abandoned by their authors.
 */

/**
 * Resolved per call rather than at module load: a top-level `process.cwd()`
 * bakes in whatever directory happened to be current when the module was first
 * imported, which is both a hidden side effect and untestable.
 */
const contentRoot = () => process.env.MEROPE_CONTENT_ROOT ?? join(process.cwd(), 'content');

/** Drafts are visible while writing and gone in the built site. */
const includeDrafts = () => process.env.NODE_ENV === 'development';

// `T extends object` rather than a bare ZodType: `z.infer` on an unconstrained
// schema widens to `unknown`, which cannot be spread.
function readCollection<T extends object>(dir: string, schema: z.ZodType<T>): Entry<T>[] {
  const root = join(contentRoot(), dir);
  if (!existsSync(root)) return [];

  return readdirSync(root)
    .filter((file) => file.endsWith('.md') || file.endsWith('.mdx'))
    .map((file) => {
      const sourcePath = relative(process.cwd(), join(root, file));
      const raw = readFileSync(join(root, file), 'utf8');
      const { data, content } = matter(raw);

      const parsed = schema.safeParse(data);
      if (!parsed.success) {
        // Fail the build rather than ship a half-rendered page.
        const issues = parsed.error.issues
          .map((i) => `  ${i.path.join('.') || '(root)'}: ${i.message}`)
          .join('\n');
        throw new Error(`Invalid frontmatter in ${sourcePath}\n${issues}`);
      }

      return {
        ...parsed.data,
        slug: file.replace(/\.mdx?$/, ''),
        body: content.trim(),
        sourcePath,
      } as Entry<T>;
    })
    .filter((entry) => includeDrafts() || !(entry as { draft?: boolean }).draft);
}

/** Newest first. */
function byDateDesc<T extends { date: Date }>(a: T, b: T) {
  return b.date.getTime() - a.date.getTime();
}

export function getNotes(): Entry<Note>[] {
  return readCollection('notes', noteSchema).sort(byDateDesc);
}

/**
 * Newest version first, numerically — `1.10.0` above `1.9.0`, which a string
 * comparison gets backwards.
 */
function byVersionDesc(a: string, b: string) {
  const parts = (v: string) =>
    v
      .split(/[^0-9]+/)
      .filter(Boolean)
      .map(Number);
  const [left, right] = [parts(a), parts(b)];
  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    const diff = (right[i] ?? 0) - (left[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

export function getReleases(): Entry<Release>[] {
  return readCollection('changelog', releaseSchema).sort((a, b) => {
    // A release is dated to the day, and a project that ships on merge puts
    // several versions on one date — three of Peace's landed on 2026-09-02.
    // Date alone leaves those to the filesystem's ordering, which is
    // alphabetical, which is ascending, which is exactly backwards.
    const byDate = byDateDesc(a, b);
    if (byDate !== 0) return byDate;
    if (a.project !== b.project) return a.project.localeCompare(b.project);
    return byVersionDesc(a.version, b.version);
  });
}

export function getProjects(): Entry<Project>[] {
  return readCollection('projects', projectSchema).sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    // Brightest first, which is what magnitude already means.
    if (a.magnitude !== b.magnitude) return a.magnitude - b.magnitude;
    return a.name.localeCompare(b.name);
  });
}

export function getNote(slug: string): Entry<Note> | undefined {
  return getNotes().find((n) => n.slug === slug);
}

export function getProject(slug: string): Entry<Project> | undefined {
  return getProjects().find((p) => p.slug === slug);
}

export function getReleasesForProject(project: string): Entry<Release>[] {
  return getReleases().filter((r) => r.project === project);
}

/**
 * Every project slug referenced by a note or release must actually exist.
 * Called by the build so a rename cannot leave dangling references behind.
 */
export function assertReferentialIntegrity(): void {
  const slugs = new Set(getProjects().map((p) => p.slug));
  const problems: string[] = [];

  for (const note of getNotes()) {
    if (note.project && !slugs.has(note.project)) {
      problems.push(`${note.sourcePath}: project "${note.project}" does not exist`);
    }
  }
  for (const release of getReleases()) {
    if (!slugs.has(release.project)) {
      problems.push(`${release.sourcePath}: project "${release.project}" does not exist`);
    }
  }

  if (problems.length) {
    throw new Error(`Dangling project references:\n${problems.map((p) => `  ${p}`).join('\n')}`);
  }
}

/**
 * The URL fragment a release is addressable by — `peace-1-7-1`.
 *
 * Built from the frontmatter rather than from the filename, unlike every other
 * slug on this site, and deliberately so: an anchor is part of a URL somebody
 * has already pasted into a README or a release mail. `project` and `version`
 * are the release's real identity; the file it happens to live in is not, and
 * renaming it must not break a link that is already out in the world.
 */
export function releaseAnchor(release: { project: string; version: string }): string {
  return `${release.project}-${release.version}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * The fragment that always points at a project's newest release —
 * `peace-latest`.
 *
 * The one release URL worth linking to from outside the site, because it does
 * not need editing when the next version ships. It is rendered on `/changelog`
 * and on the project page, on whichever row is first at build time.
 */
export function latestReleaseAnchor(project: string): string {
  return `${project}-latest`;
}

/**
 * Two releases that resolve to one anchor.
 *
 * Duplicate ids do not fail a build, fail a lint, or look wrong on the page —
 * the browser simply scrolls to the first one, and the other release is
 * quietly unreachable by URL. Since `1.7.1` and `1-7-1` normalise to the same
 * fragment, that can happen without two files ever declaring the same version.
 */
export function assertUniqueReleaseAnchors(): void {
  const seen = new Map<string, string>();
  const problems: string[] = [];

  for (const release of getReleases()) {
    const anchor = releaseAnchor(release);
    const first = seen.get(anchor);
    if (first) problems.push(`${release.sourcePath}: #${anchor} is already taken by ${first}`);
    else seen.set(anchor, release.sourcePath);
  }

  if (problems.length) {
    throw new Error(`Colliding release anchors:\n${problems.map((p) => `  ${p}`).join('\n')}`);
  }
}
