/**
 * Turning a GitHub release into a changelog entry.
 *
 * Kept pure and kept separate from `sync-releases.ts` next door, which does the
 * fetching and the writing: everything here is a string in, a string out, so
 * `tests/releases.test.ts` can cover the conversion without a network. The
 * split is the same one `static-server.ts` makes for `findChromium()`.
 *
 * The shape of the problem: GitHub's release notes and this site's release
 * bodies are both markdown and are not the same document. GitHub's
 * auto-generated notes are a list of merged pull requests addressed to people
 * who read the repository — `## What's Changed`, `by @someone in #123`, a
 * compare link at the bottom. A release on `/changelog` is an entry in a list
 * addressed to somebody deciding whether to upgrade. Most of what this file
 * does is take the first and leave something the second can use.
 */

import { releaseAnchor } from '../src/lib/content/collections';

/** The fields of the REST release payload this actually reads. */
export type GitHubRelease = {
  tag_name: string;
  name: string | null;
  body: string | null;
  draft: boolean;
  prerelease: boolean;
  published_at: string | null;
  created_at: string;
  html_url: string;
};

/** `headline` is `prose(160)` in `content/schema.ts`. Longer fails the build. */
const HEADLINE_MAX = 160;

/** The heading level a release body starts at. See `demoteHeadings`. */
const TOP_LEVEL = 3;

/**
 * The version a release is filed under — `1.7.1`.
 *
 * Tags carry decoration that a version does not: a leading `v` by overwhelming
 * convention, and in a monorepo a package name in front of it. Everything up to
 * the last `/` or `@` is that decoration; what follows is the version, which is
 * what `releaseAnchor` builds `#peace-1-7-1` out of and what the row displays.
 *
 * Build metadata — the `+build.173` of `v1.11.1+build.173` — goes with it, and
 * this is the part that is not cosmetic. Semver is explicit that build metadata
 * is not part of the version and is ignored when comparing two of them, so
 * `1.11.1+build.173` **is** version 1.11.1. A project that publishes a release
 * per CI build therefore has one version behind many releases, and keeping the
 * metadata would file each build as a version of its own: Peace's first sync
 * wrote 46 entries for 15 versions, eight of which were already on the site
 * under their real numbers. A changelog reader wants the version. Which build
 * it came out of is the repository's business.
 *
 * A pre-release suffix is left alone — `2.0.0-rc.1` is a different version from
 * `2.0.0` under the same rule, and shipping it is a different event.
 */
export function versionFromTag(tag: string): string {
  const afterSlash = tag.trim().split('/').pop() ?? tag;
  const afterAt = afterSlash.includes('@')
    ? afterSlash.slice(afterSlash.lastIndexOf('@') + 1)
    : afterSlash;
  const version = afterAt
    .replace(/^v(?=\d)/i, '')
    .replace(/\+.*$/, '')
    .trim();
  // A tag with no version in it at all (`latest`, `nightly`) is still an
  // identity, and a release has to be filed under something.
  return version || tag.trim();
}

/** One changelog entry, and the builds whose work it shipped. */
export type PlannedEntry = {
  /** The build that named the version. It dates the entry and leads its body. */
  release: GitHubRelease;
  /**
   * Later builds of the *previous* version, newest first: work done after that
   * version was cut, which therefore went out in this one.
   */
  carried: GitHubRelease[];
};

/**
 * Which releases become entries, and which fold into one.
 *
 * A project that publishes a release per CI build does not publish one release
 * per version, and the two are not the same shape. Peace bumps the version when
 * it cuts a release, so the first build carrying a version *is* that release —
 * every hand-written entry on the site is dated to the day of the first build
 * tagged with its version, all nine of them. Every build after that still says
 * the old version while the work in it is heading for the next one.
 *
 * So the first build of a version opens an entry, and the builds that follow it
 * are carried forward into the entry the next version opens. Work that has not
 * reached a version yet — builds after the newest bump — is held back rather
 * than invented into a release: the next sync sees it again, by then followed
 * by the version it shipped in.
 *
 * A version already answered for on disk takes its carried builds with it. The
 * entry exists, somebody wrote it, and this has nothing to add to it.
 */
export function planEntries(
  project: string,
  releases: readonly GitHubRelease[],
  known: ReadonlySet<string>,
): PlannedEntry[] {
  // Oldest first: a version boundary only means anything in the order the
  // builds actually happened. Sorted here rather than trusted from the API.
  const oldestFirst = [...releases].sort((a, b) =>
    (a.published_at ?? a.created_at).localeCompare(b.published_at ?? b.created_at),
  );

  const entries: PlannedEntry[] = [];
  const opened = new Set<string>();
  let carry: GitHubRelease[] = [];
  let current: string | null = null;

  for (const release of oldestFirst) {
    const version = versionFromTag(release.tag_name);
    if (version === current) {
      carry.push(release);
      continue;
    }
    current = version;
    // A version bumped, abandoned and bumped again would open twice and
    // resolve to one anchor; the first time it was cut is the one that counts.
    if (opened.has(version)) continue;
    opened.add(version);
    // Newest first, to read with the release's own notes at the top.
    entries.push({ release, carried: carry.reverse() });
    carry = [];
  }

  return entries
    .filter(
      (entry) =>
        !known.has(releaseAnchor({ project, version: versionFromTag(entry.release.tag_name) })),
    )
    .reverse();
}

/**
 * Several builds' notes, read as one release.
 *
 * Sections with the same heading are merged rather than repeated, because a
 * body carrying `### Changes` four times is not collapsed, it is stacked. Only
 * the first body's preamble is kept: on a build release that is the install
 * instructions and the commit id, which describe the build rather than the
 * release. A body with no headings at all has nothing but a preamble, so it is
 * kept whole — dropping it would lose the only thing it said.
 */
export function mergeBodies(bodies: readonly string[]): string {
  const merged: Block[] = [];
  const byHeading = new Map<string, Block>();
  const key = (heading: string) =>
    heading
      .replace(/^#+\s*/, '')
      .trim()
      .toLowerCase();

  bodies
    .filter((body) => body.trim())
    .forEach((body, index) => {
      const parsed = blocks(body);
      const headed = parsed.some((block) => block.heading !== null);

      for (const block of parsed) {
        if (block.heading === null) {
          if (index === 0 || !headed) merged.push(block);
          continue;
        }

        const existing = byHeading.get(key(block.heading));
        if (!existing) {
          byHeading.set(key(block.heading), block);
          merged.push(block);
          continue;
        }
        // A commit that appeared in two builds is one change, not two.
        const seen = new Set(existing.lines.map((line) => line.trim()).filter(Boolean));
        const addition = trimBlankEdges(block.lines).filter(
          (line) => !line.trim() || !seen.has(line.trim()),
        );
        if (addition.length) appendTo(existing, addition);
      }
    });

  return merged
    .map((block) => [block.heading, ...block.lines].filter((line) => line !== null).join('\n'))
    .join('\n\n')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** A run of markdown under one heading, or the text before the first one. */
type Block = { heading: string | null; lines: string[] };

function trimBlankEdges(lines: readonly string[]): string[] {
  const out = [...lines];
  while (out.length && !out[0].trim()) out.shift();
  while (out.length && !out[out.length - 1].trim()) out.pop();
  return out;
}

/**
 * Joins one section's content onto another's.
 *
 * Two lists become one list, with no blank line to break the run — which is the
 * whole point of merging them. Anything else keeps the blank line, because two
 * paragraphs run together read as one.
 */
function appendTo(block: Block, addition: readonly string[]): void {
  const tail = block.lines.filter((line) => line.trim()).pop() ?? '';
  const head = addition.find((line) => line.trim()) ?? '';
  const list = /^\s*([-*+]|\d+\.)\s/;

  while (block.lines.length && !block.lines[block.lines.length - 1].trim()) block.lines.pop();
  if (!(list.test(tail) && list.test(head))) block.lines.push('');
  block.lines.push(...addition);
}

function blocks(body: string): Block[] {
  const out: Block[] = [];
  let current: Block = { heading: null, lines: [] };
  let fence: string | null = null;

  for (const line of body.split('\n')) {
    const marker = /^\s*(```+|~~~+)/.exec(line);
    if (marker) {
      if (fence === null) fence = marker[1][0];
      else if (marker[1][0] === fence) fence = null;
      current.lines.push(line);
      continue;
    }
    if (fence === null && /^#{1,6}\s/.test(line)) {
      out.push(current);
      current = { heading: line.trim(), lines: [] };
      continue;
    }
    current.lines.push(line);
  }
  out.push(current);

  return out.filter((block) => block.heading !== null || block.lines.join('').trim() !== '');
}

/** `published_at`, or the creation date for a release that never published. */
export function dateFromRelease(release: GitHubRelease): string {
  return (release.published_at ?? release.created_at).slice(0, 10);
}

/**
 * Walks lines while knowing whether it is inside a fenced code block.
 *
 * Every transform below rewrites markdown by line, and a release body that
 * documents a config change contains a fence with `### something` or `- item`
 * in it. Rewriting those would edit the code being quoted.
 */
function mapLines(input: string, fn: (line: string, fenced: boolean) => string | null): string {
  let fence: string | null = null;
  const out: string[] = [];

  for (const line of input.split('\n')) {
    const marker = /^\s*(```+|~~~+)/.exec(line);
    if (marker) {
      if (fence === null) fence = marker[1][0];
      else if (marker[1][0] === fence) fence = null;
      // The fence itself is handed over as fenced content: a transform that
      // rewrites lines leaves it alone, and one that drops a section takes the
      // fence with the rest of the section rather than stranding it.
      const mapped = fn(line, true);
      if (mapped !== null) out.push(mapped);
      continue;
    }
    const mapped = fn(line, fence !== null);
    if (mapped !== null) out.push(mapped);
  }

  return out.join('\n');
}

/**
 * Shifts every heading so the shallowest one lands at `###`.
 *
 * A release body is rendered inside a list item whose `<h3>` is the version, so
 * its own sections have to start below that — and GitHub's generated notes use
 * `##`. Shifting by the shallowest rather than rewriting each level keeps the
 * relationships between a body's own sections intact.
 */
export function demoteHeadings(body: string): string {
  const levels: number[] = [];
  mapLines(body, (line, fenced) => {
    const heading = fenced ? null : /^(#{1,6})\s/.exec(line);
    if (heading) levels.push(heading[1].length);
    return line;
  });

  if (levels.length === 0) return body;
  const shift = TOP_LEVEL - Math.min(...levels);
  if (shift === 0) return body;

  return mapLines(body, (line, fenced) => {
    const heading = fenced ? null : /^(#{1,6})(\s)/.exec(line);
    if (!heading) return line;
    const level = Math.min(6, Math.max(1, heading[1].length + shift));
    return `${'#'.repeat(level)}${heading[2]}${line.slice(heading[0].length)}`;
  });
}

/**
 * Drops a whole section, heading included, up to the next heading at the same
 * level or shallower. Used for `New Contributors`, which is a fixed part of
 * GitHub's generated notes and is about the repository rather than the release.
 */
function dropSection(body: string, title: RegExp): string {
  let dropping: number | null = null;

  return mapLines(body, (line, fenced) => {
    const heading = fenced ? null : /^(#{1,6})\s*(.*)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      if (dropping !== null && level <= dropping) dropping = null;
      if (dropping === null && title.test(heading[2].trim())) {
        dropping = level;
        return null;
      }
    }
    return dropping === null ? line : null;
  });
}

/**
 * GitHub's release notes, rewritten as a release body for this site.
 *
 * Every removal here is something GitHub's own template puts in rather than
 * something an author wrote, so nothing anybody typed is dropped.
 */
export function normaliseBody(body: string | null): string {
  if (!body) return '';

  let out = body.replace(/\r\n/g, '\n');

  /**
   * HTML comments are not a formality: `.md` files here go through the MDX
   * pipeline (`src/lib/content/mdx.tsx`), and MDX rejects `<!-- -->` outright.
   * GitHub's release template ships one, so a body pasted from it would fail
   * the build rather than render the comment.
   */
  out = out.replace(/<!--[\s\S]*?-->/g, '');

  out = dropSection(out, /^new contributors\b/i);

  out = mapLines(out, (line, fenced) => {
    if (fenced) return line;
    // The compare link GitHub appends. The release is already addressable and
    // the project page already links the repository.
    if (/^\s*\*{0,2}Full Changelog\*{0,2}\s*:/i.test(line)) return null;
    // `* Fix the thing by @someone in https://github.com/o/r/pull/12` — the
    // attribution is repository business, and the sentence reads without it.
    return line.replace(/\s+by\s+@[\w-]+\s+in\s+(?:https?:\/\/\S+|#\d+)/gi, '');
  });

  out = demoteHeadings(out);

  return out
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Markdown reduced to the plain sentence underneath it. */
function plainText(input: string): string {
  return input
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Where a derived headline came from, so the script can say what to look at. */
export type HeadlineSource = 'body' | 'name' | 'version';

/**
 * The one line that carries a release row.
 *
 * This is the part of a changelog entry a release payload does not contain.
 * `headline` is the sentence `ReleaseList` sets in the reading face — the whole
 * row, before anyone expands the body — and GitHub has no field for it. What
 * follows is three guesses in descending order of how often they are right, and
 * the caller keeps the answer out of the built site until a human has read it:
 *
 * 1. An opening line of prose, which is what a hand-written release note starts
 *    with and is usually exactly the sentence wanted. Taken whole, it is also
 *    removed from the body — a headline and a standfirst that are the same
 *    sentence read as a mistake, which is why no hand-written file here opens
 *    that way.
 * 2. The release's name, when it is a title rather than the version again.
 * 3. The version, which is not a headline and is only ever a placeholder.
 *
 * Notably not on that list: the first bullet of a list of changes. It would
 * read like a headline and be one only by accident — a release of five fixes is
 * not about whichever happens to be first — and unlike `Version 1.8.0` it does
 * not announce itself as something to rewrite.
 */
export function deriveHeadline(
  release: GitHubRelease,
  body: string,
  version: string,
): { headline: string; source: HeadlineSource; body: string } {
  const lines = body.split('\n');
  let fenced = false;

  for (const [index, line] of lines.entries()) {
    if (/^\s*(```+|~~~+)/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;

    const trimmed = line.trim();
    // Anything that is a structure rather than a sentence.
    if (!trimmed || /^(#{1,6}\s|[-*+]\s|\d+\.\s|>|\||!\[)/.test(trimmed)) continue;

    const text = plainText(trimmed);
    if (!text) continue;
    // A paragraph can be longer than a headline; its first sentence usually is
    // not. Truncating instead would invent a sentence nobody wrote.
    const sentence = /^(.+?[.!?])(?:\s|$)/.exec(text)?.[1] ?? text;
    if (sentence.length > HEADLINE_MAX) break;

    // The line is only spent if the headline used all of it. Taking one
    // sentence out of a paragraph and deleting the rest would lose prose.
    const spent = sentence === text;
    return {
      headline: sentence,
      source: 'body',
      body: spent ? withoutLine(lines, index) : body,
    };
  }

  const name = release.name?.trim();
  if (name && name.length <= HEADLINE_MAX && !isVersionLike(name, version)) {
    return { headline: plainText(name), source: 'name', body };
  }

  return { headline: `Version ${version}`, source: 'version', body };
}

/** Drops a line, and the blank line it leaves behind at the top of a body. */
function withoutLine(lines: readonly string[], index: number): string {
  const kept = [...lines.slice(0, index), ...lines.slice(index + 1)];
  return kept
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** `v1.7.1`, `1.7.1`, `Release 1.7.1` — the version wearing a hat. */
function isVersionLike(name: string, version: string): boolean {
  const bare = name.replace(/^(release|version)\s+/i, '').trim();
  return bare === version || bare === `v${version}` || /^v?\d+[\d.]*$/i.test(bare);
}

/**
 * Whether the release says, in its own words, that it breaks something.
 *
 * `breaking` drives `--mark`, which `AGENTS.md` reserves for the one thing that
 * needs a human before upgrading, so this reads only an explicit section
 * heading — a body that happens to use the word in a sentence is not a flag.
 * It is a suggestion for the human reviewing the file either way.
 */
export function looksBreaking(body: string): boolean {
  return /^#{1,6}\s*[^\n]*\bbreaking\b/im.test(body);
}

/**
 * A YAML scalar that survives the round trip.
 *
 * Single-quoted to match the repository's prettier config, and quoted at all
 * because of the trap in `AGENTS.md`: YAML types unquoted scalars, so a release
 * tagged `1.7` would arrive at `releaseSchema` as the number 1.7 and be
 * rejected, while `1.7.1` would not. A version is a string always or it is a
 * string by luck.
 */
function yamlString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

export type ReleaseFile = {
  project: string;
  version: string;
  /** `YYYY-MM-DD`. Unquoted, as every hand-written file here has it. */
  date: string;
  headline: string;
  breaking: boolean;
  /** Written only when true; the schema defaults it. */
  draft: boolean;
  body: string;
};

/** The finished `content/changelog/*.md`. */
export function renderReleaseFile(file: ReleaseFile): string {
  const frontmatter = [
    `project: ${yamlString(file.project)}`,
    `version: ${yamlString(file.version)}`,
    `date: ${file.date}`,
    `headline: ${yamlString(file.headline)}`,
    // Always written, unlike `draft`: it is the field a human has to decide,
    // and a key that is present is one they will see.
    `breaking: ${file.breaking}`,
    ...(file.draft ? ['draft: true'] : []),
  ];

  return `---\n${frontmatter.join('\n')}\n---\n\n${file.body}\n`.replace(/\n{3,}$/, '\n');
}
