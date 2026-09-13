<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Merope

The landing page and content home for the Merope software studio (merope.dev).
Individual projects live on subdomains; this repo is the front door.

Read `docs/BRAND.md` before touching design, and `docs/ROADMAP.md` before
deciding something is in or out of scope.

## Non-negotiables

- **The site is fully static** (`output: 'export'`). No middleware, server
  actions, ISR, or runtime image optimisation. Headers live in `vercel.json`.
- **Two themes, always both.** Every change must survive the `plate`/`sky`
  toggle. Never define a colour only inside one theme block.
- **No sans-serif.** Prose is Newsreader, labels and data are IBM Plex Mono.
  See `src/design/fonts.ts` for why.
- **Two accents only.** `--accent` is the star's own colour; `--mark` is the
  grease pencil and means _this needs attention_ — focus rings, breaking
  changes, nothing else.
- **Lore must be true.** Every astronomical fact comes from `src/lib/merope.ts`.
  Values marked `@unverified` are not to be presented as fact on a public page
  until checked.

## Layout

```
src/design/     The design system. Kept self-contained so Phase 6 can lift it
                into a package — nothing here may import from src/app.
src/lib/        merope.ts (lore), site.ts (config), content/ (build-time loader)
content/        notes/, changelog/, projects/ — markdown with validated frontmatter
scripts/        shoot.ts (screenshots), check-content.ts, static-server.ts
docs/           BRAND.md, ROADMAP.md
```

## Verifying work

`pnpm verify` runs everything CI runs. Order matters: the token tests assert
against the built CSS, so the build has to come first.

**Look at your changes.** `pnpm build && pnpm shoot / /styleguide` writes
screenshots of every route in both themes at both breakpoints to `.shots/`, and
fails on any console error. A green build says nothing about whether a page is
any good.

## Traps already hit here

- **Tailwind v4 tree-shakes `@theme` variables** that no generated utility
  references. A token read only through `var(--x)` in an inline style will
  silently vanish from the bundle, and a missing `opacity` falls back to `1` —
  so the page still renders and nothing reports a problem. Magnitude tokens are
  `@theme static` for this reason. `tests/tokens.test.ts` guards it.
- **`class="max-w-[--foo]"` does not reference a variable in Tailwind v4** —
  that syntax sets a custom property. Use `max-w-(--foo)`.
- **YAML parses an unquoted `date: 2026-09-13` into a `Date`**, not a string, so
  frontmatter schemas must accept both.
- Next 16 removed the `eslint` key from `next.config.ts`; lint is its own step.
