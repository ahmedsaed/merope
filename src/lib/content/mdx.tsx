import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode, { type Options as PrettyCodeOptions } from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import remarkSmartypants from 'remark-smartypants';

/**
 * The MDX pipeline. One place, so every surface that renders prose — notes,
 * release bodies, project pages — gets identical typography and identical
 * heading anchors.
 *
 * All of this runs at build time. Nothing here ships to the browser.
 */

const prettyCodeOptions: PrettyCodeOptions = {
  /**
   * Two themes, emitted together as `--shiki-light` / `--shiki-dark` custom
   * properties on each token, so a code block re-themes with the rest of the
   * page and never needs a second render. `prose.css` binds those variables to
   * the plate/sky attribute, with the OS preference as the fallback when no
   * choice has been made — the same three-step cascade the colour tokens use.
   */
  theme: { light: 'github-light-default', dark: 'github-dark-default' },
  keepBackground: false,
  defaultLang: 'text',
};

const remarkPlugins = [
  remarkGfm,
  // Real quotes, dashes and ellipses. On a site that leans this hard on
  // typography, straight quotes in prose would undo the rest of the work.
  remarkSmartypants,
];

const rehypePlugins = [[rehypePrettyCode, prettyCodeOptions]];

/**
 * Heading anchors, for the surfaces where a heading is a destination.
 *
 * A note is a document and its headings are places in it. A release body is
 * not: it is an entry in a list, and every release the studio has ever shipped
 * has a section called Added. Slugging those put eight elements called `added`
 * on `/changelog` — the browser resolves `#added` to the first of them, so six
 * release bodies carried a § that scrolled the reader to a different release.
 * The addressable unit of a release is the release, which is what
 * `releaseAnchor` is for.
 */
const anchorPlugins = [
  rehypeSlug,
  [
    rehypeAutolinkHeadings,
    {
      behavior: 'wrap',
      properties: { className: 'anchor-link' },
    },
  ],
];

/** Components available to every MDX file without an import. */
const components = {
  /**
   * A margin note. The plate metaphor made usable: an aside lettered the way an
   * observer annotated the edge of a photographic plate.
   */
  Annotation: ({ children }: { children: React.ReactNode }) => (
    <aside className="border-accent text-ink-muted my-6 border-l-2 py-1 pl-4">
      <span className="annotation text-accent mb-1 block">Note</span>
      {children}
    </aside>
  ),
};

export function Markdown({
  source,
  /** Off where a heading is a label rather than a destination — see above. */
  anchors = true,
}: {
  source: string;
  anchors?: boolean;
}) {
  return (
    <MDXRemote
      source={source}
      components={components}
      options={{
        mdxOptions: {
          // Cast: the plugin tuples are correctly shaped but the unified types
          // do not narrow through a shared array literal.
          remarkPlugins: remarkPlugins as never,
          rehypePlugins: (anchors ? [...anchorPlugins, ...rehypePlugins] : rehypePlugins) as never,
        },
      }}
    />
  );
}
