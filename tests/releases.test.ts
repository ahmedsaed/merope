import matter from 'gray-matter';
import { describe, expect, it } from 'vitest';
import { releaseSchema } from '@/lib/content/schema';
import { releaseAnchor } from '@/lib/content/collections';
import {
  dateFromRelease,
  demoteHeadings,
  deriveHeadline,
  looksBreaking,
  normaliseBody,
  renderReleaseFile,
  versionFromTag,
  type GitHubRelease,
} from '../scripts/release-notes';

/**
 * The GitHub → changelog conversion behind `pnpm sync:releases`.
 *
 * Tested without a network, which is the whole reason the conversion lives in
 * its own module: the script next door does the fetching, and none of what is
 * interesting here needs it.
 */

const release = (overrides: Partial<GitHubRelease> = {}): GitHubRelease => ({
  tag_name: 'v1.7.1',
  name: null,
  body: null,
  draft: false,
  prerelease: false,
  published_at: '2026-09-02T11:04:17Z',
  created_at: '2026-09-01T09:00:00Z',
  html_url: 'https://github.com/ahmedsaed/Peace/releases/tag/v1.7.1',
  ...overrides,
});

describe('versionFromTag', () => {
  it('drops the conventional v', () => {
    expect(versionFromTag('v1.7.1')).toBe('1.7.1');
    expect(versionFromTag('1.7.1')).toBe('1.7.1');
  });

  it('drops a package prefix, so a monorepo tag still yields a version', () => {
    expect(versionFromTag('peace/v1.7.1')).toBe('1.7.1');
    expect(versionFromTag('peace@1.7.1')).toBe('1.7.1');
    expect(versionFromTag('@merope/peace@1.7.1')).toBe('1.7.1');
  });

  it('keeps a tag that carries no version rather than filing it under nothing', () => {
    expect(versionFromTag('nightly')).toBe('nightly');
  });

  it('does not eat a leading v that is part of a word', () => {
    expect(versionFromTag('venus')).toBe('venus');
  });
});

describe('dateFromRelease', () => {
  it('uses the publication date, to the day, in UTC', () => {
    expect(dateFromRelease(release())).toBe('2026-09-02');
  });

  it('falls back to creation for a release with no publication date', () => {
    expect(dateFromRelease(release({ published_at: null }))).toBe('2026-09-01');
  });
});

describe('normaliseBody', () => {
  it('demotes headings so the shallowest starts at h3', () => {
    // The release body renders inside a row whose h3 is the version.
    expect(demoteHeadings("## What's Changed\n\n### Details")).toBe(
      "### What's Changed\n\n#### Details",
    );
  });

  it('leaves a body that already starts at h3 alone', () => {
    expect(demoteHeadings('### Added\n\n### Fixed')).toBe('### Added\n\n### Fixed');
  });

  it('does not rewrite headings inside a code fence', () => {
    const body = '## Changed\n\n```md\n# not a heading here\n```';
    expect(normaliseBody(body)).toBe('### Changed\n\n```md\n# not a heading here\n```');
  });

  it('strips the HTML comment GitHub ships, which MDX cannot compile', () => {
    expect(normaliseBody('<!-- generated -->\nReal prose.')).toBe('Real prose.');
  });

  it('drops the compare link and the pull request attributions', () => {
    const body = [
      "## What's Changed",
      '* Fix the loan card by @ahmedsaed in https://github.com/ahmedsaed/Peace/pull/42',
      '* Split the breakdown by @someone-else in #43',
      '',
      '**Full Changelog**: https://github.com/ahmedsaed/Peace/compare/v1.7.0...v1.7.1',
    ].join('\n');

    expect(normaliseBody(body)).toBe(
      "### What's Changed\n* Fix the loan card\n* Split the breakdown",
    );
  });

  it('drops the New Contributors section, heading and all', () => {
    const body =
      '## New Contributors\n* @someone made their first contribution\n\n## Changed\n* A thing';
    expect(normaliseBody(body)).toBe('### Changed\n* A thing');
  });

  it('is empty for a release with no notes rather than throwing', () => {
    expect(normaliseBody(null)).toBe('');
  });
});

describe('deriveHeadline', () => {
  it('takes an opening line of prose, which is what a written note starts with', () => {
    const body = 'The Now card explains itself.\n\n### Added\n- a thing';
    expect(deriveHeadline(release(), body, '1.7.1')).toEqual({
      headline: 'The Now card explains itself.',
      source: 'body',
      // Spent: a row whose headline and whose first line of body are the same
      // sentence reads as a mistake.
      body: '### Added\n- a thing',
    });
  });

  it('takes the first sentence, because a paragraph can outrun the 160 the schema allows', () => {
    const body = `${'A sentence that is quite long. '.repeat(10)}`;
    const { headline } = deriveHeadline(release(), body, '1.7.1');
    expect(headline).toBe('A sentence that is quite long.');
  });

  it('keeps a paragraph it only took one sentence from', () => {
    const body = 'It arrived. And then some more detail nobody should lose.';
    const { headline, body: kept } = deriveHeadline(release(), body, '1.7.1');
    expect(headline).toBe('It arrived.');
    expect(kept).toBe(body);
  });

  it('reads through markdown to the sentence underneath', () => {
    const body = 'The **Now** card [explains](https://merope.dev) itself.';
    expect(deriveHeadline(release(), body, '1.7.1').headline).toBe('The Now card explains itself.');
  });

  it('leaves the body alone when the headline came from somewhere else', () => {
    const body = '### Added\n- a thing';
    expect(deriveHeadline(release({ name: 'A title' }), body, '1.7.1').body).toBe(body);
  });

  it('ignores headings, lists and fenced code when looking for a sentence', () => {
    const body = '### Added\n- a thing\n\n```ts\nconst x = 1;\n```';
    expect(deriveHeadline(release({ name: 'Quieter notifications' }), body, '1.7.1')).toEqual({
      headline: 'Quieter notifications',
      source: 'name',
      body,
    });
  });

  it('refuses a name that is only the version wearing a hat', () => {
    for (const name of ['v1.7.1', '1.7.1', 'Release 1.7.1']) {
      expect(deriveHeadline(release({ name }), '', '1.7.1')).toEqual({
        headline: 'Version 1.7.1',
        source: 'version',
        body: '',
      });
    }
  });

  it('never returns more than the schema will accept', () => {
    const body = `${'word '.repeat(200)}`;
    const { headline, source } = deriveHeadline(release({ name: null }), body, '1.7.1');
    expect(headline.length).toBeLessThanOrEqual(160);
    // Nothing usable in either place: a placeholder, flagged as one.
    expect(source).toBe('version');
  });
});

describe('looksBreaking', () => {
  it('reads an explicit section, since --mark is only for a decision a human owes', () => {
    expect(looksBreaking('### Breaking changes\n- the config moved')).toBe(true);
  });

  it('does not flag a body that merely says the word', () => {
    expect(looksBreaking('### Fixed\n- stopped breaking on an empty file')).toBe(false);
  });
});

describe('renderReleaseFile', () => {
  const file = {
    project: 'peace',
    version: '1.7.1',
    date: '2026-09-02',
    headline: 'The Now card explains itself.',
    breaking: false,
    draft: true,
    body: '### Added\n- a thing',
  };

  it('emits frontmatter the real schema accepts', () => {
    const { data } = matter(renderReleaseFile(file));
    const parsed = releaseSchema.parse(data);
    expect(parsed.project).toBe('peace');
    expect(parsed.version).toBe('1.7.1');
    expect(parsed.date.toISOString()).toBe('2026-09-02T00:00:00.000Z');
    expect(parsed.draft).toBe(true);
  });

  /**
   * The trap in `AGENTS.md`, one field over: YAML types an unquoted scalar, so
   * a project tagged `1.7` would reach `releaseSchema` as the number 1.7 and be
   * rejected — while `1.7.1` would sail through, which is how this would have
   * been found in production rather than here.
   */
  it('quotes the version, so a two-part one stays a string', () => {
    const { data } = matter(renderReleaseFile({ ...file, version: '1.7' }));
    expect(data.version).toBe('1.7');
    expect(releaseSchema.parse(data).version).toBe('1.7');
  });

  it('survives an apostrophe in the headline', () => {
    const headline = "It's the studio's changelog.";
    const { data } = matter(renderReleaseFile({ ...file, headline }));
    expect(data.headline).toBe(headline);
  });

  it('omits draft when the release is published, leaving the schema default', () => {
    const { data } = matter(renderReleaseFile({ ...file, draft: false }));
    expect(data.draft).toBeUndefined();
    expect(releaseSchema.parse(data).draft).toBe(false);
  });

  it('files the release under the anchor the site addresses it by', () => {
    const { data } = matter(renderReleaseFile(file));
    expect(releaseAnchor({ project: data.project, version: data.version })).toBe('peace-1-7-1');
  });
});
