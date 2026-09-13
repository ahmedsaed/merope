import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /**
   * Fully static. Every route is an HTML file in `out/`, so the site can move
   * between hosts without a rewrite. The cost is deliberate and accepted: no
   * ISR, no middleware, no server actions, no runtime image optimisation.
   * See docs/ROADMAP.md if any of those ever start looking necessary.
   */
  output: 'export',

  images: {
    // Required by `output: 'export'` — there is no server to resize on demand.
    // Phase 3 adds a build-time image pipeline rather than a hosted loader.
    unoptimized: true,
  },

  // Surfaces browser console errors in the terminal, where an agent can read
  // them. See node_modules/next/dist/docs/01-app/02-guides/ai-agents.md.
  logging: { browserToTerminal: true },

  // Next 16 dropped `next lint`; ESLint runs as its own CI step instead.
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
