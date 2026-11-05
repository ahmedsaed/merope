import { describe, expect, it } from 'vitest';
import { getProjects } from '@/lib/content/collections';
import { COORDINATE_LINE, NEBULA, STAR } from '@/lib/merope';
import { SITE } from '@/lib/site';
import { renderOrgProfile } from '../scripts/org-profile';

describe('organisation profile', () => {
  const projects = getProjects();
  const readme = renderOrgProfile(projects);

  it('lists every catalogued project, brightest first, linked to its page here', () => {
    const rows = readme.split('\n').filter((line) => /^\| \d \|/.test(line));
    expect(rows).toHaveLength(projects.length);
    projects.forEach((p, i) => {
      expect(rows[i]).toContain(`[${p.name}](${SITE.url}/projects/${p.slug})`);
      expect(rows[i].startsWith(`| ${p.magnitude} |`)).toBe(true);
    });
  });

  it('never lists a draft', () => {
    expect(readme).not.toContain('/projects/_seed');
  });

  it('links the code only where there is a repository', () => {
    const noRepo = renderOrgProfile([{ slug: 'x', name: 'X', summary: 'A thing.', magnitude: 5 }]);
    expect(noRepo).toMatch(/\| 5 \| \[X\]\([^)]+\) \| A thing\. \| — \|/);
  });

  it('keeps a pipe in a summary from splitting the row', () => {
    const piped = renderOrgProfile([{ slug: 'x', name: 'X', summary: 'In | out.', magnitude: 3 }]);
    expect(piped).toContain('In \\| out.');
  });

  it('takes every fact about the star from merope.ts', () => {
    expect(readme).toContain(`magnitude ${STAR.magnitude}`);
    expect(readme).toContain('fourth-brightest');
    expect(readme).toContain(NEBULA.ngc);
    expect(readme).toContain(NEBULA.thesis);
    expect(readme).toContain(COORDINATE_LINE);
  });
});
