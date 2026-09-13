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
