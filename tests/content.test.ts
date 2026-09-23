import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  assertReferentialIntegrity,
  getNotes,
  getProjects,
  getReleases,
} from '@/lib/content/collections';
import { noteSchema, projectSchema } from '@/lib/content/schema';
import { extractHeadings } from '@/lib/content/headings';
import { typeset } from '@/lib/typeset';

describe('frontmatter schemas', () => {
  it('rejects a date that is not YYYY-MM-DD', () => {
    const result = noteSchema.safeParse({
      title: 'x',
      description: 'x',
      date: '13-09-2026',
    });
    expect(result.success).toBe(false);
  });

  it('parses dates as UTC so a post cannot shift a day', () => {
    const result = noteSchema.parse({ title: 'x', description: 'x', date: '2026-09-13' });
    expect(result.date.toISOString()).toBe('2026-09-13T00:00:00.000Z');
  });

  it('refuses a magnitude outside the real scale', () => {
    const base = {
      name: 'x',
      summary: 'x',
      kind: 'tool',
      firstLight: '2026-01-01',
    };
    expect(projectSchema.safeParse({ ...base, magnitude: 0 }).success).toBe(false);
    expect(projectSchema.safeParse({ ...base, magnitude: 8 }).success).toBe(false);
    expect(projectSchema.safeParse({ ...base, magnitude: 4 }).success).toBe(true);
  });

  it('defaults draft to false rather than undefined', () => {
    const note = noteSchema.parse({ title: 'x', description: 'x', date: '2026-01-01' });
    expect(note.draft).toBe(false);
  });
});

/**
 * Numeric, and written out here rather than imported: a test that borrows the
 * implementation's comparator agrees with it by construction, including where
 * both are wrong. `1.10.0` above `1.9.0` is the case a string sort gets
 * backwards.
 */
function highestFirst(a: string, b: string): number {
  const parts = (version: string) =>
    version
      .split(/[^0-9]+/)
      .filter(Boolean)
      .map(Number);
  const [left, right] = [parts(a), parts(b)];
  for (let i = 0; i < Math.max(left.length, right.length); i += 1) {
    const difference = (right[i] ?? 0) - (left[i] ?? 0);
    if (difference !== 0) return difference;
  }
  return 0;
}

describe('collections', () => {
  it('loads every sample file without throwing', () => {
    expect(getProjects().length).toBeGreaterThan(0);
    expect(getNotes().length).toBeGreaterThan(0);
    expect(getReleases().length).toBeGreaterThan(0);
  });

  it('derives slugs from filenames, not frontmatter', () => {
    expect(getProjects().map((p) => p.slug)).toContain('merope-dev');
  });

  it('orders projects brightest first', () => {
    const mags = getProjects()
      .filter((p) => p.order === undefined)
      .map((p) => p.magnitude);
    expect([...mags]).toEqual([...mags].sort((a, b) => a - b));
  });

  it('sorts notes newest first', () => {
    const times = getNotes().map((n) => n.date.getTime());
    expect([...times]).toEqual([...times].sort((a, b) => b - a));
  });

  it('sorts releases newest first', () => {
    const times = getReleases().map((r) => r.date.getTime());
    expect([...times]).toEqual([...times].sort((a, b) => b - a));
  });

  /**
   * A release is dated to the day, and a project that ships on merge puts
   * several versions on one date — three of Peace's 1.x releases landed on
   * 2026-09-02. Sorting on the date alone leaves those to `readdirSync`, which
   * is alphabetical, which is ascending, which is exactly backwards on a page
   * headed "newest first".
   *
   * Asserted as the rule rather than as the list of versions it held when this
   * was written. `pnpm sync:releases` adds releases to this directory, so a
   * literal list is a test that fails every time the studio ships something —
   * which is the one moment nobody wants to be reading a test failure. The
   * guard is the ordering; the content is whatever it is by now.
   */
  it('breaks a same-day tie on the version, highest first', () => {
    const days = new Map<string, string[]>();
    for (const release of getReleases().filter((r) => r.project === 'peace')) {
      const day = release.date.toISOString().slice(0, 10);
      days.set(day, [...(days.get(day) ?? []), release.version]);
    }

    const ties = [...days.values()].filter((versions) => versions.length > 1);
    // Without a day carrying two releases this test proves nothing, and the
    // bug it guards would sail straight through it.
    expect(ties.length).toBeGreaterThan(0);

    for (const versions of ties) {
      expect(versions).toEqual([...versions].sort(highestFirst));
    }
  });

  it('finds no dangling project references in the real content', () => {
    expect(() => assertReferentialIntegrity()).not.toThrow();
  });
});

describe('build-time failure modes', () => {
  const dirs: string[] = [];

  afterEach(() => {
    delete process.env.MEROPE_CONTENT_ROOT;
    for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
  });

  /** Points the loader at a throwaway content tree. */
  function fixture(files: Record<string, string>): void {
    const root = mkdtempSync(join(tmpdir(), 'merope-content-'));
    dirs.push(root);
    for (const [path, body] of Object.entries(files)) {
      const full = join(root, path);
      mkdirSync(join(full, '..'), { recursive: true });
      writeFileSync(full, body);
    }
    process.env.MEROPE_CONTENT_ROOT = root;
  }

  it('names the offending file when frontmatter is invalid', () => {
    fixture({ 'notes/broken.md': '---\ntitle: no date here\ndescription: x\n---\nbody\n' });
    expect(() => getNotes()).toThrow(/broken\.md/);
  });

  it('explains which field was wrong', () => {
    fixture({ 'notes/broken.md': '---\ntitle: x\ndescription: x\ndate: nonsense\n---\nbody\n' });
    expect(() => getNotes()).toThrow(/date/);
  });

  it('accepts an unquoted YAML date, which is what people actually write', () => {
    fixture({ 'notes/ok.md': '---\ntitle: x\ndescription: x\ndate: 2026-09-13\n---\nbody\n' });
    expect(getNotes()[0].date.toISOString()).toBe('2026-09-13T00:00:00.000Z');
  });

  it('accepts a quoted date too', () => {
    fixture({ 'notes/ok.md': '---\ntitle: x\ndescription: x\ndate: "2026-09-13"\n---\nbody\n' });
    expect(getNotes()[0].date.toISOString()).toBe('2026-09-13T00:00:00.000Z');
  });

  it('catches a release pointing at a project that does not exist', () => {
    fixture({
      'changelog/ghost-1-0-0.md':
        '---\nproject: not-a-real-project\nversion: 1.0.0\ndate: 2026-01-01\nheadline: x\n---\n',
    });
    expect(() => assertReferentialIntegrity()).toThrow(/not-a-real-project/);
  });

  it('returns an empty collection rather than throwing when a directory is absent', () => {
    fixture({ 'notes/ok.md': '---\ntitle: x\ndescription: x\ndate: 2026-01-01\n---\n' });
    expect(getProjects()).toEqual([]);
  });
});

describe('frontmatter is typeset', () => {
  /**
   * Note bodies go through remark-smartypants; frontmatter does not. That left
   * a page whose body had real apostrophes and whose standfirst, one line
   * above it, had typewriter ones. Guarded here because the failure is
   * invisible unless you look closely at the right sentence.
   */
  it('turns apostrophes in a description into real ones', () => {
    expect(typeset("this site's light theme")).toBe('this site’s light theme');
  });

  it('opens a quote only where a quote can open', () => {
    expect(typeset(`He said "look twice" and left`)).toBe('He said “look twice” and left');
    expect(typeset("'Lost Pleiad' is a title")).toBe('‘Lost Pleiad’ is a title');
  });

  it('leaves a possessive at the end of a word alone as an apostrophe', () => {
    expect(typeset("the Pleiades' own parts")).toBe('the Pleiades’ own parts');
  });

  it('handles dashes and ellipses without touching a hyphenated word', () => {
    expect(typeset('spare parts -- real work')).toBe('spare parts – real work');
    expect(typeset('one --- two')).toBe('one — two');
    expect(typeset('and so on...')).toBe('and so on…');
    expect(typeset('blue-white subgiant')).toBe('blue-white subgiant');
  });

  it('leaves text that needs nothing untouched', () => {
    const clean = 'The star is not the point. What it lights up is.';
    expect(typeset(clean)).toBe(clean);
  });

  it('applies to real content, not just to unit inputs', () => {
    // Every loaded note must already be typeset — no surface should have to.
    for (const note of getNotes()) {
      expect(note.title, `${note.slug} title`).not.toMatch(/['"]/);
      expect(note.description, `${note.slug} description`).not.toMatch(/['"]/);
    }
  });
});

describe('heading extraction for the contents list', () => {
  /**
   * The contents list links to anchors generated by a separate pass over the
   * same text (rehype-slug). These two agreeing is the only thing that makes
   * the margin work, and a hand-rolled slugify agrees right up until the first
   * heading with an ampersand — hence the shared slugger, and hence this test.
   */
  it('slugs the way rehype-slug does, ampersands included', () => {
    expect(extractHeadings('## Notes & asides')[0]).toEqual({
      depth: 2,
      text: 'Notes & asides',
      slug: 'notes--asides',
    });
  });

  it('numbers repeats the way the rendered anchors will', () => {
    const headings = extractHeadings('## Notes\n\ntext\n\n## Notes');
    expect(headings.map((h) => h.slug)).toEqual(['notes', 'notes-1']);
  });

  it('keeps depth so the list can indent', () => {
    const headings = extractHeadings('## Two\n\n### Three');
    expect(headings.map((h) => h.depth)).toEqual([2, 3]);
  });

  it('ignores a comment inside a fenced block', () => {
    const source = ['## Real', '', '```sh', '# not a heading', '```', '', '## Also real'].join(
      '\n',
    );
    expect(extractHeadings(source).map((h) => h.text)).toEqual(['Real', 'Also real']);
  });

  it('strips inline markup so the list reads as words', () => {
    expect(extractHeadings('## A `code` and a [link](/x)')[0].text).toBe('A code and a link');
  });

  it('ignores h1, which is the page title and never appears in a body', () => {
    expect(extractHeadings('# Title\n\n## Section').map((h) => h.text)).toEqual(['Section']);
  });
});
