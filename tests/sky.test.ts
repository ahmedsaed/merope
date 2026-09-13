import { describe, expect, it } from 'vitest';
import { PLEIADES } from '@/lib/merope';
import { decToDegrees, projectCluster, radiusForMagnitude, raToHours } from '@/lib/sky';

/**
 * The projection is the one place where getting the maths subtly wrong produces
 * something that still looks like a star chart. A cluster stretched 9% sideways,
 * or mirrored east-for-west, renders perfectly happily and is simply not the
 * sky — so the geometry is asserted against known facts about the Pleiades
 * rather than eyeballed in a screenshot.
 */

const byName = (name: string) => {
  const found = projectCluster(PLEIADES).find((p) => p.star.name === name);
  if (!found) throw new Error(`${name} missing from the projection`);
  return found;
};

describe('coordinate conversion', () => {
  it('converts sexagesimal right ascension to decimal hours', () => {
    expect(raToHours({ h: 3, m: 46, s: 19.586 })).toBeCloseTo(3.772107, 5);
  });

  it('converts sexagesimal declination to decimal degrees', () => {
    expect(decToDegrees({ d: 23, m: 56, s: 54.092 })).toBeCloseTo(23.948359, 5);
  });

  it('handles a whole number of hours without drift', () => {
    expect(raToHours({ h: 3, m: 0, s: 0 })).toBe(3);
  });
});

describe('projectCluster', () => {
  it('draws east to the left, the way a sky chart is drawn', () => {
    // Alcyone has the largest right ascension in the set, so it is furthest
    // east, so it must sit furthest LEFT. Getting this backwards mirrors the sky.
    const alcyone = byName('Alcyone');
    const others = projectCluster(PLEIADES).filter((p) => p.star.name !== 'Alcyone');
    for (const other of others) {
      expect(alcyone.x).toBeLessThan(other.x);
    }
  });

  it('puts Merope furthest south, which is why she sits below the cluster', () => {
    const merope = byName('Merope');
    const others = projectCluster(PLEIADES).filter((p) => p.star.name !== 'Merope');
    for (const other of others) {
      // Screen y grows downward, so furthest south is the largest y.
      expect(merope.y).toBeGreaterThan(other.y);
    }
  });

  it('puts Taygeta furthest north', () => {
    const taygeta = byName('Taygeta');
    const others = projectCluster(PLEIADES).filter((p) => p.star.name !== 'Taygeta');
    for (const other of others) {
      expect(taygeta.y).toBeLessThan(other.y);
    }
  });

  it('keeps every star inside the padded field', () => {
    for (const p of projectCluster(PLEIADES, { padding: 0.12 })) {
      expect(p.x).toBeGreaterThanOrEqual(0.12 - 1e-9);
      expect(p.x).toBeLessThanOrEqual(0.88 + 1e-9);
      expect(p.y).toBeGreaterThanOrEqual(0.12 - 1e-9);
      expect(p.y).toBeLessThanOrEqual(0.88 + 1e-9);
    }
  });

  it('applies the cos(dec) term, so the cluster is not stretched sideways', () => {
    // At +24°, a degree of RA is ~91% the width of a degree of declination.
    // Dropping the term widens the cluster by ~9% — invisible as a bug, wrong
    // as a star chart. Checked by comparing the projected aspect against the
    // true angular aspect computed independently here.
    const points = PLEIADES.map((s) => ({
      ra: raToHours(s.ra),
      dec: decToDegrees(s.dec),
    }));
    const decCentre = points.reduce((sum, p) => sum + p.dec, 0) / points.length;
    const cosDec = Math.cos((decCentre * Math.PI) / 180);

    const xsDeg = points.map((p) => p.ra * 15 * cosDec);
    const ysDeg = points.map((p) => p.dec);
    const trueAspect =
      (Math.max(...xsDeg) - Math.min(...xsDeg)) / (Math.max(...ysDeg) - Math.min(...ysDeg));

    const projected = projectCluster(PLEIADES);
    const xs = projected.map((p) => p.x);
    const ys = projected.map((p) => p.y);
    const drawnAspect = (Math.max(...xs) - Math.min(...xs)) / (Math.max(...ys) - Math.min(...ys));

    expect(drawnAspect).toBeCloseTo(trueAspect, 4);
  });

  it('scales brightness so the brightest star is 1 and the faintest is 0', () => {
    const projected = projectCluster(PLEIADES);
    expect(byName('Alcyone').brightness).toBeCloseTo(1, 6);
    expect(byName('Celaeno').brightness).toBeCloseTo(0, 6);
    for (const p of projected) {
      expect(p.brightness).toBeGreaterThanOrEqual(0);
      expect(p.brightness).toBeLessThanOrEqual(1);
    }
  });

  it('returns nothing for an empty set rather than dividing by zero', () => {
    expect(projectCluster([])).toEqual([]);
  });

  it('survives a single star without producing NaN', () => {
    const [only] = projectCluster([PLEIADES[0]]);
    expect(Number.isFinite(only.x)).toBe(true);
    expect(Number.isFinite(only.y)).toBe(true);
    expect(Number.isFinite(only.brightness)).toBe(true);
  });
});

describe('radiusForMagnitude', () => {
  it('makes brighter stars bigger', () => {
    expect(radiusForMagnitude(2.87, 3)).toBeGreaterThan(radiusForMagnitude(4.18, 3));
    expect(radiusForMagnitude(4.18, 3)).toBeGreaterThan(radiusForMagnitude(5.45, 3));
  });

  it('never lets a faint star vanish', () => {
    // True flux would make Alcyone ~13x Celaeno's area and the faint members
    // would disappear at small sizes. The floor is the compression.
    expect(radiusForMagnitude(12, 3)).toBeGreaterThanOrEqual(3 * 0.42);
  });
});
