/**
 * Writes the organisation profile README from the catalogue.
 *
 *   pnpm org:profile                     print it
 *   pnpm org:profile path/to/README.md   write it there
 *
 * `.github/workflows/org-profile.yml` runs this against a checkout of
 * merope-studio/.github and commits the result when it changed.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { getProjects } from '../src/lib/content/collections';
import { renderOrgProfile } from './org-profile';

const readme = renderOrgProfile(getProjects());
const target = process.argv[2];

if (!target) {
  process.stdout.write(readme);
} else {
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, readme);
  console.log(`wrote ${target}`);
}
