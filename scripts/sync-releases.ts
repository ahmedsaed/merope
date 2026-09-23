/**
 * Writes `content/changelog/*.md` from the GitHub releases of the projects in
 * the catalogue.
 *
 *   pnpm sync:releases                 every catalogued project with a repo
 *   pnpm sync:releases peace           one of them
 *   pnpm sync:releases --dry-run       print what it would write
 *   pnpm sync:releases --draft         write them as drafts, invisible to a build
 *
 * Why a script and a committed file rather than a fetch at render time: the
 * site is `output: 'export'`, so there is no render time — the same reason the
 * star field is a committed module and the OG card is a committed PNG.
 *
 * **What it writes still needs reading.** A release payload carries the version,
 * the date and the notes; it does not carry the two things a row on
 * `/changelog` needs a person for — the headline, which is the sentence the row
 * is read as, and `breaking`, which is the one thing `--mark` exists for. Both
 * are guessed, and a guess the conversion could not make at all arrives as
 * `Version 1.11.1`, marked `!` in the output below.
 *
 * These are written live rather than as drafts, because the review happens
 * somewhere better than a flag: the workflow opens a pull request, the whole
 * site builds from it, and the entries can be read on the preview as rows on a
 * page rather than as frontmatter. That also puts them through `check:content`
 * and the build, which skip drafts entirely — so an entry that would break the
 * site now says so before anybody merges it. `--draft` restores the old
 * behaviour for a local run you do not intend to publish.
 *
 * It never edits a file that already exists. A release is identified by its
 * anchor — `peace-1-7-1`, from frontmatter, the thing that may already be
 * pasted in somebody's README — so re-running this is safe and re-runs cost
 * nothing: everything already synced is already known.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import matter from 'gray-matter';
import { format, resolveConfig } from 'prettier';
import { getProjects, releaseAnchor } from '../src/lib/content/collections';
import {
  boilerplateOf,
  dateFromRelease,
  deriveHeadline,
  dropBoilerplate,
  looksBreaking,
  normaliseBody,
  renderReleaseFile,
  mergeBodies,
  planEntries,
  versionFromTag,
  type Boilerplate,
  type GitHubRelease,
  type HeadlineSource,
  type PlannedEntry,
} from './release-notes';

const CHANGELOG_DIR = join(process.cwd(), 'content/changelog');
const PER_PAGE = 100;
/** A first sync of a long-lived project, and then never again. */
const MAX_PAGES = 5;

type Options = { dryRun: boolean; draft: boolean; only: Set<string> };

function parseArgs(argv: string[]): Options {
  const only = new Set<string>();
  let dryRun = false;
  let draft = false;

  for (const arg of argv) {
    if (arg === '--dry-run') dryRun = true;
    else if (arg === '--draft') draft = true;
    // A mistyped flag must not be read as a project slug and silently sync
    // nothing at all.
    else if (arg.startsWith('-')) throw new Error(`unknown option ${arg}`);
    else only.add(arg);
  }

  return { dryRun, draft, only };
}

/** `https://github.com/ahmedsaed/Peace` → `ahmedsaed/Peace`. */
function githubRepo(url: string): { owner: string; name: string } | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.hostname !== 'github.com' && parsed.hostname !== 'www.github.com') return null;

  const [owner, name] = parsed.pathname.replace(/^\/+/, '').split('/');
  if (!owner || !name) return null;
  return { owner, name: name.replace(/\.git$/, '') };
}

/**
 * Every release anchor already on disk, drafts included.
 *
 * Read straight from the directory rather than through `getReleases()`, which
 * hides drafts outside `next dev`. An entry somebody is still drafting — by
 * hand, or from a `--draft` run — is an entry that exists, and going through a
 * reader that cannot see it would mean writing a second one over the top.
 */
function knownAnchors(): Set<string> {
  if (!existsSync(CHANGELOG_DIR)) return new Set();

  const anchors = new Set<string>();
  for (const file of readdirSync(CHANGELOG_DIR)) {
    if (!file.endsWith('.md') && !file.endsWith('.mdx')) continue;
    const { data } = matter(readFileSync(join(CHANGELOG_DIR, file), 'utf8'));
    const project = data.project;
    const version = data.version;
    if (typeof project !== 'string' || version === undefined) continue;
    anchors.add(releaseAnchor({ project, version: String(version) }));
  }
  return anchors;
}

async function fetchReleases(owner: string, name: string): Promise<GitHubRelease[]> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    // GitHub rejects a request without one.
    'User-Agent': 'merope-sync-releases',
  };
  // Optional: the unauthenticated limit is 60 requests an hour, which is more
  // than a studio this size needs, and a token raises it for CI.
  const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  const releases: GitHubRelease[] = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const url = `https://api.github.com/repos/${owner}/${name}/releases?per_page=${PER_PAGE}&page=${page}`;
    const response = await fetch(url, { headers });

    if (response.status === 404) throw new Error('no such repository, or it is private');
    if (response.status === 403 || response.status === 429) {
      // GitHub answers 403 both for "you have run out of requests" and for
      // "you may not read this", and the remedy is not the same one.
      const exhausted = response.headers.get('x-ratelimit-remaining') === '0';
      throw new Error(
        exhausted
          ? 'rate limited — set GITHUB_TOKEN to raise the limit'
          : `forbidden (${response.status}) — ${((await response.json()) as { message?: string }).message ?? 'no reason given'}`,
      );
    }
    if (!response.ok) throw new Error(`GitHub returned ${response.status}`);

    const batch = (await response.json()) as GitHubRelease[];
    releases.push(...batch);
    if (batch.length < PER_PAGE) break;
  }
  return releases;
}

type Written = { path: string; version: string; headline: string; source: HeadlineSource };

async function writeRelease(
  project: string,
  entry: PlannedEntry,
  boilerplate: Boilerplate,
  options: Options,
): Promise<Written> {
  const { release, carried } = entry;
  const version = versionFromTag(release.tag_name);
  // The release's own notes, then the notes of every build that went out in
  // it, read as one body rather than stacked — each first stripped of whatever
  // this project says in every release.
  const notes = mergeBodies(
    [release, ...carried].map((r) => dropBoilerplate(normaliseBody(r.body), boilerplate)),
  );
  // The headline may consume the body's opening line, so the body to write is
  // the one that comes back out rather than the one that went in.
  const { headline, source, body } = deriveHeadline(release, notes, version, project);

  const file = join(CHANGELOG_DIR, `${releaseAnchor({ project, version })}.md`);
  const contents = renderReleaseFile({
    project,
    version,
    date: dateFromRelease(release),
    headline,
    breaking: looksBreaking(body),
    draft: options.draft,
    body,
  });

  // Formatted on the way out rather than left for `pnpm format` to catch: a
  // generated file that fails `format:check` fails CI, and the first anyone
  // would hear of it is a red tick on a pull request nobody hand-edited.
  const config = await resolveConfig(file);
  const formatted = await format(contents, { ...config, filepath: file });

  if (!options.dryRun) writeFileSync(file, formatted);
  return { path: relative(process.cwd(), file), version, headline, source };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  /**
   * Draft projects are skipped, which `getProjects()` already does outside
   * `next dev`: the seeds in `content/projects/_seed-*.md` carry repository
   * URLs for repositories that do not exist, and syncing them would mean five
   * 404s on every run.
   */
  const projects = getProjects().filter((p) => !options.only.size || options.only.has(p.slug));

  const unknown = [...options.only].filter((slug) => !projects.some((p) => p.slug === slug));
  if (unknown.length) throw new Error(`no such project: ${unknown.join(', ')}`);
  if (projects.length === 0) throw new Error('no projects in the catalogue');

  const known = knownAnchors();
  const written: Written[] = [];
  const failures: string[] = [];

  for (const project of projects) {
    const repo = project.repo ? githubRepo(project.repo) : null;
    if (!repo) {
      console.log(`${project.slug.padEnd(14)} skipped — no GitHub repository`);
      continue;
    }

    let releases: GitHubRelease[];
    try {
      releases = await fetchReleases(repo.owner, repo.name);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      console.error(`${project.slug.padEnd(14)} failed — ${reason}`);
      failures.push(project.slug);
      continue;
    }

    // A draft release is unpublished and a pre-release is not what the
    // catalogue means by shipped.
    const published = releases.filter((r) => !r.draft && !r.prerelease);
    const entries = planEntries(project.slug, published, known);

    // Read from every release the project has, including the ones already on
    // the site: the more of them, the surer the reading of what repeats.
    const boilerplate = boilerplateOf(published.map((r) => normaliseBody(r.body)));

    for (const entry of entries) {
      written.push(await writeRelease(project.slug, entry, boilerplate, options));
    }

    const folded = entries.reduce((n, entry) => n + entry.carried.length, 0);
    console.log(
      `${project.slug.padEnd(14)} ${entries.length} new` +
        (folded ? `, ${folded} later build(s) folded in` : '') +
        `, ${published.length - entries.length - folded} already here` +
        (releases.length > published.length
          ? ` (${releases.length - published.length} draft/pre-release ignored)`
          : ''),
    );
  }

  if (written.length) {
    console.log('');
    for (const entry of written) {
      // The headline is the one field worth printing: it is the line the row is
      // read as, and the guess behind it is the reason these land as drafts.
      const flag = entry.source === 'body' ? ' ' : '!';
      console.log(`${flag} ${entry.path.padEnd(42)} ${entry.headline}`);
    }
    const flagged = written.filter((entry) => entry.source === 'version').length;
    console.log(
      `\n${written.length} file(s)${options.dryRun ? ' would be written' : ' written'}` +
        (options.draft ? ', all draft: true' : '') +
        (flagged ? `. ${flagged} marked ! need a headline written.` : '.'),
    );
  } else {
    console.log('\nnothing new.');
  }

  if (failures.length) process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
