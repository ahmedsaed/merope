import { afterEach, describe, expect, it, vi } from 'vitest';
import sitemap from '@/app/sitemap';
import { getProjects, getReleasesForProject } from '@/lib/content/collections';
import { SITE } from '@/lib/site';

/**
 * The sitemap's dates come from the content, never from the build.
 *
 * A `lastModified` that moves on every deploy tells a crawler a page changed
 * when it did not; one pinned to a project's launch tells it the page never
 * changes. Google stops trusting the field once it catches either, for the
 * whole site. Both shipped here before these tests existed.
 */
describe('sitemap dates', () => {
  afterEach(() => vi.useRealTimers());

  const at = (iso: string) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(iso));
    return JSON.stringify(sitemap());
  };

  it('does not depend on when the site was built', () => {
    expect(at('2030-01-01T00:00:00Z')).toBe(at('2031-06-15T12:34:56Z'));
  });

  it('dates every page except the one with no honest date', () => {
    const undated = sitemap()
      .filter((entry) => entry.lastModified === undefined)
      .map((entry) => entry.url);
    expect(undated).toEqual([`${SITE.url}/studio`]);
  });

  it('never dates a project page before its own newest release', () => {
    const entries = new Map(sitemap().map((e) => [e.url, e.lastModified as Date]));
    for (const project of getProjects()) {
      const page = entries.get(`${SITE.url}/projects/${project.slug}`)!;
      for (const release of getReleasesForProject(project.slug)) {
        expect(page.getTime(), `${project.slug} ${release.version}`).toBeGreaterThanOrEqual(
          release.date.getTime(),
        );
      }
    }
  });
});

describe('project dates', () => {
  it('never claims an edit before the project existed', () => {
    for (const project of getProjects()) {
      if (!project.updated) continue;
      expect(project.updated.getTime(), project.slug).toBeGreaterThanOrEqual(
        project.firstLight.getTime(),
      );
    }
  });
});
