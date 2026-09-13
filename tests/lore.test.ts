import { describe, expect, it } from 'vitest';
import { MAGNITUDE_CLASSES, NEBULA, STAR, SUPERCOMPUTER } from '@/lib/merope';

/**
 * Regression guards for lore that has already been got wrong once.
 *
 * These are not testing logic — they are testing facts, deliberately, because
 * both of the corrections below are mistakes the sources themselves repeat. A
 * future editor "fixing" either one back would be reverting to something false,
 * and a plain constant gives them nothing to push back against.
 *
 * Citations: docs/LORE.md.
 */

describe('facts that popular sources get wrong', () => {
  it('Merope is the fourth-brightest sister, not the faintest', () => {
    // Celaeno (5.44) and Asterope (5.64) are both dimmer. The "Lost Pleiad"
    // title is mythological, not photometric.
    expect(STAR.rankAmongSisters).toBe(4);
    expect(STAR.magnitude).toBeCloseTo(4.18, 2);
  });

  it('the NASA supercomputer was built from Pleiades, not Columbia', () => {
    // Harpertown nodes retired from the original 2008 Pleiades. Columbia was a
    // different NAS system entirely and had nothing to do with Merope.
    expect(SUPERCOMPUTER.builtFrom).toBe('Pleiades');
    expect(SUPERCOMPUTER.builtFrom).not.toBe('Columbia');
  });
});

describe('the thesis the studio is named for', () => {
  it('keeps the nebula an interloper rather than Merope’s own', () => {
    // NGC 1435 is not the Pleiades' natal cloud — it is unrelated dust the
    // cluster is currently passing through. Losing this loses the brand.
    expect(NEBULA.thesis).toBe('The star is not the point. What it lights up is.');
  });
});

describe('the magnitude scale stays a real scale', () => {
  it('runs 1 to 7 with no gaps', () => {
    expect(MAGNITUDE_CLASSES.map((m) => m.mag)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('puts the naked-eye limit at 6, where it actually is', () => {
    expect(MAGNITUDE_CLASSES[5].meaning).toMatch(/naked-eye limit/i);
  });
});
