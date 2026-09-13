import { describe, expect, it } from 'vitest';
import {
  MAGNITUDE_CLASSES,
  NEBULA,
  PLEIADES,
  PLEIADES_MISSING,
  STAR,
  SUPERCOMPUTER,
} from '@/lib/merope';

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
    // Celaeno (5.46) and Asterope (5.76) are both dimmer. The "Lost Pleiad"
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

describe('the cluster data', () => {
  it('holds all nine members, so the asterism is the real one', () => {
    // Seven sisters plus Atlas and Pleione, their parents. The pair is the
    // eastern handle and the cluster does not read as the Pleiades without it —
    // which is exactly how the gap was noticed.
    expect(PLEIADES).toHaveLength(9);
    expect(PLEIADES.filter((s) => s.sister)).toHaveLength(7);
    expect(
      PLEIADES.filter((s) => !s.sister)
        .map((s) => s.name)
        .sort(),
    ).toEqual(['Atlas', 'Pleione']);
  });

  it('ranks Merope fourth among the sisters, as STAR claims she is', () => {
    // The rank is stored as a constant and is also derivable from the table.
    // Asserting they agree stops one being corrected without the other.
    const sisters = PLEIADES.filter((s) => s.sister).sort((a, b) => a.magnitude - b.magnitude);
    expect(sisters.findIndex((s) => s.name === 'Merope') + 1).toBe(STAR.rankAmongSisters);
  });

  it('has no outstanding coordinates', () => {
    // Non-empty means a member is missing and the star field is not the sky.
    // The styleguide renders this list in grease pencil for the same reason.
    expect(PLEIADES_MISSING).toEqual([]);
  });
});
