import { describe, expect, it } from 'vitest';
import { PLEIADES } from '@/lib/merope';
import {
  decToDegrees,
  placeLabels,
  projectCluster,
  radiusForMagnitude,
  raToHours,
} from '@/lib/sky';

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
    // Pleione has the largest right ascension in the set (03h 49m 11.2s, just
    // east of Atlas), so it is furthest east, so it must sit furthest LEFT.
    // Getting this backwards mirrors the sky.
    const pleione = byName('Pleione');
    const others = projectCluster(PLEIADES).filter((p) => p.star.name !== 'Pleione');
    for (const other of others) {
      expect(pleione.x).toBeLessThan(other.x);
    }
  });

  it('puts Atlas and Pleione together at the eastern handle', () => {
    // The pair is the cluster's most recognisable feature and they sit ~5' apart
    // — if the asterism does not read as the Pleiades, this is the first thing
    // to check. Everything else is at least a third of the field away.
    const atlas = byName('Atlas');
    const pleione = byName('Pleione');
    expect(Math.abs(atlas.x - pleione.x)).toBeLessThan(0.02);
    expect(Math.abs(atlas.y - pleione.y)).toBeLessThan(0.1);

    const others = projectCluster(PLEIADES).filter(
      (p) => p.star.name !== 'Atlas' && p.star.name !== 'Pleione',
    );
    for (const other of others) {
      expect(other.x - atlas.x).toBeGreaterThan(0.25);
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

  it('puts Asterope furthest north', () => {
    // Asterope at +24 33' is the northernmost member, five arcminutes above
    // Taygeta, which held this position while the data was incomplete.
    const asterope = byName('Asterope');
    const others = projectCluster(PLEIADES).filter((p) => p.star.name !== 'Asterope');
    for (const other of others) {
      expect(asterope.y).toBeLessThan(other.y);
    }
  });

  it('centres the cluster in the field on both axes', () => {
    // The cluster is ~1.7x wider than tall and one scale serves both axes, so
    // the shorter axis cannot fill the frame. It must be centred in it: anchoring
    // both axes at their minimum pins the asterism to the top of the field and
    // leaves a dead band under it, which looks like a layout bug and is one.
    const projected = projectCluster(PLEIADES, { padding: 0.12 });
    const xs = projected.map((p) => p.x);
    const ys = projected.map((p) => p.y);
    expect((Math.min(...xs) + Math.max(...xs)) / 2).toBeCloseTo(0.5, 6);
    expect((Math.min(...ys) + Math.max(...ys)) / 2).toBeCloseTo(0.5, 6);
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
    expect(byName('Asterope').brightness).toBeCloseTo(0, 6);
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
    expect(radiusForMagnitude(4.18, 3)).toBeGreaterThan(radiusForMagnitude(5.46, 3));
  });

  it('never lets a faint star vanish', () => {
    // True flux would make Alcyone ~13x Celaeno's area and the faint members
    // would disappear at small sizes. The floor is the compression.
    expect(radiusForMagnitude(12, 3)).toBeGreaterThanOrEqual(3 * 0.42);
  });
});

describe('placeLabels', () => {
  const VIEW = 100;
  const FONT = 3.4;
  const advance = FONT * 0.72;

  type Box = { name: string; x0: number; x1: number; y0: number; y1: number };

  /** The rectangle a rendered label occupies, reconstructed from its anchor. */
  const boxes = (ring?: { name: string; radius: number }): Box[] =>
    placeLabels(projectCluster(PLEIADES), { view: VIEW, ring }).map((l) => {
      const w = l.star.name.length * advance;
      const x0 = l.anchor === 'start' ? l.x : l.anchor === 'end' ? l.x - w : l.x - w / 2;
      return { name: l.star.name, x0, x1: x0 + w, y0: l.y - FONT * 0.85, y1: l.y + FONT * 0.2 };
    });

  const hit = (a: Box, b: Box) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;

  it('never lets two labels overlap', () => {
    // Atlas and Pleione are 5 arcminutes apart and Asterope sits directly above
    // Taygeta. With one fixed offset per label, three of the nine collide.
    const all = boxes();
    for (let i = 0; i < all.length; i += 1) {
      for (let j = i + 1; j < all.length; j += 1) {
        expect(hit(all[i], all[j]), `${all[i].name} overlaps ${all[j].name}`).toBe(false);
      }
    }
  });

  it('never lets a label land on a star', () => {
    const projected = projectCluster(PLEIADES);
    for (const label of boxes()) {
      for (const p of projected) {
        const r = radiusForMagnitude(p.star.magnitude, 2.6);
        const dot = {
          name: p.star.name,
          x0: p.x * VIEW - r,
          x1: p.x * VIEW + r,
          y0: p.y * VIEW - r,
          y1: p.y * VIEW + r,
        };
        expect(hit(label, dot), `${label.name} lands on ${dot.name}`).toBe(false);
      }
    }
  });

  it('clears the grease-pencil ring, not just the dot under it', () => {
    // Merope's ring is three times her dot. A label that only clears the dot
    // is drawn straight through the one gesture the whole mark is built on.
    const ring = { name: 'Merope', radius: 5 };
    const merope = projectCluster(PLEIADES).find((p) => p.star.name === 'Merope')!;
    const label = boxes(ring).find((l) => l.name === 'Merope')!;
    const box = {
      name: 'ring',
      x0: merope.x * VIEW - ring.radius,
      x1: merope.x * VIEW + ring.radius,
      y0: merope.y * VIEW - ring.radius,
      y1: merope.y * VIEW + ring.radius,
    };
    expect(hit(label, box)).toBe(false);
  });

  it('keeps every label inside the field', () => {
    for (const l of boxes()) {
      expect(l.x0).toBeGreaterThanOrEqual(0);
      expect(l.x1).toBeLessThanOrEqual(VIEW);
      expect(l.y0).toBeGreaterThanOrEqual(0);
      expect(l.y1).toBeLessThanOrEqual(VIEW);
    }
  });

  it('returns labels in catalogue order, so rendering is stable', () => {
    const projected = projectCluster(PLEIADES);
    expect(placeLabels(projected).map((l) => l.star.name)).toEqual(
      projected.map((p) => p.star.name),
    );
  });
});
