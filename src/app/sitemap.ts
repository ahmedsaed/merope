import type { MetadataRoute } from 'next';
import { getNotes, getProjects, getReleases } from '@/lib/content/collections';
import { SITE } from '@/lib/site';

/**
 * The sitemap, generated at build time into a static file.
 *
 * Built from the content layer rather than a hand-kept list, so a note that
 * exists is a note that is listed. Drafts are already filtered out by the
 * loader, which means a draft cannot leak here either — the one place a stray
 * URL would survive a build and be handed to a crawler.
 *
 * `/styleguide` is deliberately absent: it is noindex, and listing a page you
 * have asked not to be indexed is a mixed signal.
 *
 * Every `lastModified` is a date the content carries, never the time of the
 * build. Google uses the field only while it proves accurate: a page stamped
 * with every deploy claims to change when it did not, and a project page
 * stamped with its launch date claims never to change at all. Both were here,
 * and both teach a crawler to ignore the field for the whole site. A page
 * with no honest date — `/studio`, whose words live in code — gives none,
 * which the protocol allows and which is better than a wrong one.
 */
export const dynamic = 'force-static';

const newest = (dates: Date[]): Date | undefined =>
  dates.length > 0 ? new Date(Math.max(...dates.map((d) => d.getTime()))) : undefined;

export default function sitemap(): MetadataRoute.Sitemap {
  const notes = getNotes();
  const projects = getProjects();
  const releases = getReleases();

  const noteDates = notes.map((note) => ({
    note,
    modified: note.updated ?? note.date,
  }));

  // A project page shows its own text and every release, so it changed when
  // either did.
  const projectDates = projects.map((project) => ({
    project,
    modified: newest([
      project.updated ?? project.firstLight,
      ...releases.filter((r) => r.project === project.slug).map((r) => r.date),
    ])!,
  }));

  const notesIndex = newest(noteDates.map((n) => n.modified));
  const projectsIndex = newest(projectDates.map((p) => p.modified));

  return [
    // The home page carries the catalogue and the latest notes.
    {
      url: SITE.url,
      lastModified: newest([notesIndex, projectsIndex].filter((d) => d !== undefined)),
      priority: 1,
    },
    { url: `${SITE.url}/projects`, lastModified: projectsIndex },
    { url: `${SITE.url}/notes`, lastModified: notesIndex },
    { url: `${SITE.url}/changelog`, lastModified: newest(releases.map((r) => r.date)) },
    { url: `${SITE.url}/studio` },
    ...projectDates.map(({ project, modified }) => ({
      url: `${SITE.url}/projects/${project.slug}`,
      lastModified: modified,
    })),
    ...noteDates.map(({ note, modified }) => ({
      url: `${SITE.url}/notes/${note.slug}`,
      lastModified: modified,
    })),
  ];
}
