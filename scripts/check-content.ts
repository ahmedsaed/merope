/**
 * Pre-build content check.
 *
 * Frontmatter is validated lazily, when a page happens to read a collection, so
 * a file nothing renders yet could stay broken indefinitely. This walks every
 * collection up front and checks cross-references, which no single page can do.
 */
import {
  assertReferentialIntegrity,
  getNotes,
  getProjects,
  getReleases,
} from '../src/lib/content/collections';

try {
  const projects = getProjects();
  const notes = getNotes();
  const releases = getReleases();
  assertReferentialIntegrity();

  console.log(
    `content ok — ${projects.length} project(s), ${notes.length} note(s), ${releases.length} release(s)`,
  );
} catch (error) {
  console.error(`\ncontent check failed\n`);
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
