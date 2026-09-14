import type { MetadataRoute } from 'next';
import { getNotes, getProjects } from '@/lib/content/collections';
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
 */
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const notes = getNotes();
  const projects = getProjects();

  const newest = (dates: Date[]) =>
    dates.length > 0 ? new Date(Math.max(...dates.map((d) => d.getTime()))) : new Date();

  return [
    { url: SITE.url, lastModified: newest(notes.map((n) => n.updated ?? n.date)), priority: 1 },
    { url: `${SITE.url}/projects`, lastModified: newest(projects.map((p) => p.firstLight)) },
    { url: `${SITE.url}/notes`, lastModified: newest(notes.map((n) => n.updated ?? n.date)) },
    { url: `${SITE.url}/changelog`, lastModified: new Date() },
    { url: `${SITE.url}/studio`, lastModified: new Date() },
    ...projects.map((project) => ({
      url: `${SITE.url}/projects/${project.slug}`,
      lastModified: project.firstLight,
    })),
    ...notes.map((note) => ({
      url: `${SITE.url}/notes/${note.slug}`,
      lastModified: note.updated ?? note.date,
    })),
  ];
}
