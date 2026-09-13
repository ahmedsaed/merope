'use client';

import { useEffect, useRef } from 'react';
import { StarField } from './StarField';

/**
 * The star field, with the one piece of motion this site allows itself.
 *
 * Motion was decided at almost none (docs/ROADMAP.md): a long exposure on the
 * theme change, and the nebula responding very slightly to the pointer. No
 * scroll-triggered reveals, nothing that blocks reading — on a page this
 * typographic, restraint is the distinctive part.
 *
 * What moves is the dust, never the stars. The positions are catalogue
 * positions; sliding them around would undo the one claim the field makes. The
 * nebula, on the other hand, is genuinely incidental — an unrelated cloud the
 * cluster happens to be drifting through — so it is the thing that may drift.
 *
 * Written against CSS custom properties rather than React state so a pointer
 * move never triggers a render: this component mounts, sets two variables, and
 * is otherwise inert.
 */

/** Maximum drift, in viewBox units. The field is 100 across. */
const TRAVEL = 2.4;

export function HeroField({ size = 400 }: { size?: number }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = host.current;
    if (!node) return;

    // The site honours reduced motion by zeroing its durations; this one has no
    // duration to zero, so it has to opt out itself.
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (calm.matches) return;

    // Coarse pointers have no hover, so the effect would only ever fire as a
    // jump on tap. Skip it rather than animate on touch.
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const onMove = (event: PointerEvent) => {
      const box = node.getBoundingClientRect();
      const dx = (event.clientX - (box.left + box.width / 2)) / (box.width / 2);
      const dy = (event.clientY - (box.top + box.height / 2)) / (box.height / 2);
      // Clamped, and inverted: the cloud lags the pointer rather than chasing
      // it, which is the difference between drifting and following.
      const clamp = (n: number) => Math.max(-1, Math.min(1, n));
      node.style.setProperty('--nebula-x', `${-clamp(dx) * TRAVEL}px`);
      node.style.setProperty('--nebula-y', `${-clamp(dy) * TRAVEL}px`);
    };

    const onLeave = () => {
      node.style.setProperty('--nebula-x', '0px');
      node.style.setProperty('--nebula-y', '0px');
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div ref={host} className="relative w-full md:w-auto md:shrink-0">
      {/* A clearing in the backdrop.
          The page's sky and this cluster are the same patch of sky at different
          scales, so where they overlap the background stars read as debris
          around the asterism rather than as depth behind it. A pool of ground
          colour under the field removes them without the backdrop needing to
          know anything about where this element ended up on the page — which it
          cannot know, since the layout decides that. Soft to the edge, so it is
          a clearing and never a shape. */}
      <div
        aria-hidden
        className="exposure pointer-events-none absolute inset-0 -z-10 scale-125"
        style={{
          // Flat colour, shaped by a mask. The obvious way to write this is a
          // radial-gradient of `--ground` — but `background-image` cannot be
          // transitioned, so on a theme change the clearing would snap to the
          // new colour while the page behind it took the full 900ms, and the
          // cluster would sit in a visible patch of the wrong theme. A
          // background-color transitions; the mask is static and carries the
          // shape.
          backgroundColor: 'var(--ground)',
          maskImage:
            'radial-gradient(ellipse 62% 70% at 50% 50%, #000 0%, #000 48%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 62% 70% at 50% 50%, #000 0%, #000 48%, transparent 100%)',
        }}
      />
      <StarField size={size} crop nebula />
    </div>
  );
}
