import type { FieldStar } from './field';
import { PLEIADES, type PleiadesStar } from './merope';

/**
 * Turning sky coordinates into screen coordinates.
 *
 * Pure functions, no React, no DOM — so the projection can be unit-tested
 * against known geometry rather than eyeballed in a screenshot. Everything here
 * runs at build time.
 */

/** Sexagesimal right ascension to decimal hours. */
export function raToHours(ra: { h: number; m: number; s: number }): number {
  return ra.h + ra.m / 60 + ra.s / 3600;
}

/** Sexagesimal declination to decimal degrees. Northern hemisphere only, which
 *  is all the Pleiades needs — Merope sits at +24°. */
export function decToDegrees(dec: { d: number; m: number; s: number }): number {
  return dec.d + dec.m / 60 + dec.s / 3600;
}

export type Projected = {
  star: PleiadesStar;
  /** 0..1 across the field, left to right as it appears in the sky. */
  x: number;
  /** 0..1 down the field. */
  y: number;
  /** 0..1, where 1 is the brightest star in the set. */
  brightness: number;
};

/**
 * Flat tangent-plane projection.
 *
 * The Pleiades spans about a degree, so the error from ignoring the sphere is
 * far below a pixel and a gnomonic projection would be false precision. The one
 * thing that genuinely matters is the `cos(dec)` term: a degree of right
 * ascension is narrower than a degree of declination at +24°, and dropping it
 * stretches the cluster sideways by about 9% — visible, and wrong.
 *
 * East is left. Sky charts are drawn as seen looking up, not as a map.
 */
export type Projection = {
  /** Field centre on the sky, and the cos(dec) term at it. */
  raCentreHours: number;
  decCentre: number;
  cosDec: number;
  /** Degrees on the sky that map to the usable width of the field. */
  span: number;
  midX: number;
  midY: number;
  centre: number;
  usable: number;
};

/** The transform the cluster defines. `projectionFor` is the general form. */
function clusterProjection(
  stars: readonly PleiadesStar[] = PLEIADES,
  { padding = 0.12 }: { padding?: number } = {},
): Projection {
  return projectionFor(
    stars.map((star) => ({ raHours: raToHours(star.ra), decDeg: decToDegrees(star.dec) })),
    { padding },
  );
}

/** The transform that fits a set of sky positions into the 0..1 field. */
export function projectionFor(
  points: readonly { raHours: number; decDeg: number }[],
  { padding = 0.12 }: { padding?: number } = {},
): Projection {
  const decCentre = points.reduce((sum, p) => sum + p.decDeg, 0) / points.length;
  const cosDec = Math.cos((decCentre * Math.PI) / 180);
  const raCentreHours = points.reduce((sum, p) => sum + p.raHours, 0) / points.length;

  // Degrees on the sky, relative to the field centre. Negated so east falls left.
  const xs = points.map((p) => -(p.raHours - raCentreHours) * 15 * cosDec);
  // Screen y grows downward, declination grows up.
  const ys = points.map((p) => -(p.decDeg - decCentre));

  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);

  // One scale for both axes, or the cluster's real shape is lost.
  const span = Math.max(maxX - minX, maxY - minY) || 1;
  const usable = 1 - padding * 2;

  // The cluster is about 1.7x wider than it is tall, so with a single scale the
  // shorter axis does not fill the field. Centre each axis on its own extent
  // rather than anchoring both at the minimum, which would otherwise pin the
  // whole asterism to the top of the frame and leave a dead band beneath it.
  return {
    raCentreHours,
    decCentre,
    cosDec,
    span,
    midX: (minX + maxX) / 2,
    midY: (minY + maxY) / 2,
    centre: padding + usable / 2,
    usable,
  };
}

/** One sky position through the transform, in 0..1 field coordinates. */
export function projectPoint(
  { raHours, decDeg }: { raHours: number; decDeg: number },
  p: Projection,
): { x: number; y: number } {
  const dx = -(raHours - p.raCentreHours) * 15 * p.cosDec;
  const dy = -(decDeg - p.decCentre);
  return {
    x: p.centre + ((dx - p.midX) / p.span) * p.usable,
    y: p.centre + ((dy - p.midY) / p.span) * p.usable,
  };
}

export function projectCluster(
  stars: readonly PleiadesStar[] = PLEIADES,
  { padding = 0.12 }: { padding?: number } = {},
): Projected[] {
  if (stars.length === 0) return [];

  const projection = clusterProjection(stars, { padding });

  const magnitudes = stars.map((s) => s.magnitude);
  const brightest = Math.min(...magnitudes);
  const faintest = Math.max(...magnitudes);
  const magRange = faintest - brightest || 1;

  return stars.map((star) => ({
    star,
    ...projectPoint({ raHours: raToHours(star.ra), decDeg: decToDegrees(star.dec) }, projection),
    // Magnitude is already logarithmic, so a linear ramp across it reads as an
    // even progression. See the note on --mag-* in tokens.css.
    brightness: 1 - (star.magnitude - brightest) / magRange,
  }));
}

export type ProjectedField = { x: number; y: number; mag: number };

/**
 * The background field, fitted to its own extent rather than the cluster's.
 *
 * This is the sky the site is set on, not a detail drawn behind the nine — it
 * spans three degrees where the asterism spans one, so it gets its own
 * transform. The two are the same patch of sky at different scales, the way an
 * archive holds a wide plate and a detail print of the same object; they are not
 * claimed to be in register, and nothing in the design depends on them being so.
 */
export function projectField(field: readonly FieldStar[]): ProjectedField[] {
  const points = field.map(([ra, dec]) => ({ raHours: ra / 15, decDeg: dec }));
  const projection = projectionFor(points, { padding: 0 });
  return field.map(([, , mag], i) => ({ ...projectPoint(points[i], projection), mag }));
}

/**
 * Dot radius for a star, in the same units as the caller's viewBox.
 *
 * Not physically proportional: true flux would make Alcyone roughly 13x
 * Celaeno's area and the faint members would vanish. This compresses the range
 * so every member stays visible while the ordering stays honest.
 */
export function radiusForMagnitude(magnitude: number, base: number): number {
  const scaled = base * (1.15 - (magnitude - 2.8) * 0.11);
  return Math.max(base * 0.42, scaled);
}

/* ------------------------------------------------------------------------ */

export type Anchor = 'start' | 'middle' | 'end';

export type PlacedLabel = {
  star: PleiadesStar;
  /** Label anchor point, in viewBox units. */
  x: number;
  y: number;
  anchor: Anchor;
};

type Box = { x0: number; y0: number; x1: number; y1: number };

const overlaps = (a: Box, b: Box) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;

/**
 * Where each star's name goes.
 *
 * Labels cannot be placed by hand for the same reason the dots cannot: the
 * positions come from the catalogue, so anything hand-tuned is wrong the moment
 * a member is added. Atlas and Pleione are five arcminutes apart and Asterope
 * sits directly above Taygeta — put every label in the same place relative to
 * its dot and three of the nine collide.
 *
 * So: try the four positions an astronomer would try, in order, and take the
 * first that hits nothing. Brightest star first, because when something has to
 * be displaced it should be the faint one. Deterministic, and unit-tested
 * against the real cluster rather than eyeballed.
 */
export function placeLabels(
  projected: readonly Projected[],
  {
    view = 100,
    dotBase = 2.6,
    fontSize = 3.4,
    gap = 1.6,
    ring,
  }: {
    view?: number;
    dotBase?: number;
    fontSize?: number;
    gap?: number;
    /** A star drawn inside a grease-pencil ring clears the ring, not the dot. */
    ring?: { name: string; radius: number };
  } = {},
): PlacedLabel[] {
  // IBM Plex Mono at the tracking the annotation style sets. Close enough to
  // reserve space with; a character either way does not change a decision.
  const advance = fontSize * 0.72;

  const radiusOf = (p: Projected) =>
    ring && p.star.name === ring.name ? ring.radius : radiusForMagnitude(p.star.magnitude, dotBase);

  const dots: Box[] = projected.map((p) => {
    const r = radiusOf(p);
    return { x0: p.x * view - r, y0: p.y * view - r, x1: p.x * view + r, y1: p.y * view + r };
  });

  const placed: Box[] = [];
  const order = [...projected].sort((a, b) => a.star.magnitude - b.star.magnitude);

  const result = order.map((p) => {
    const cx = p.x * view;
    const cy = p.y * view;
    const r = radiusOf(p);
    const w = p.star.name.length * advance;
    const h = fontSize;

    const candidates: { x: number; y: number; anchor: Anchor; box: Box }[] = [
      // Above, then below, then out to either side. `y` is a text baseline, so
      // the box runs upward from it.
      { x: cx, y: cy - r - gap, anchor: 'middle' as const },
      { x: cx, y: cy + r + gap + h * 0.85, anchor: 'middle' as const },
      { x: cx + r + gap, y: cy + h * 0.35, anchor: 'start' as const },
      { x: cx - r - gap, y: cy + h * 0.35, anchor: 'end' as const },
    ].map((c) => ({
      ...c,
      box: {
        x0: c.anchor === 'start' ? c.x : c.anchor === 'end' ? c.x - w : c.x - w / 2,
        y0: c.y - h * 0.85,
        x1: c.anchor === 'start' ? c.x + w : c.anchor === 'end' ? c.x : c.x + w / 2,
        y1: c.y + h * 0.2,
      },
    }));

    const free =
      candidates.find(
        (c) =>
          c.box.x0 >= 0 &&
          c.box.x1 <= view &&
          c.box.y0 >= 0 &&
          c.box.y1 <= view &&
          !dots.some((d) => overlaps(c.box, d)) &&
          !placed.some((q) => overlaps(c.box, q)),
      ) ?? candidates[0];

    placed.push(free.box);
    return { star: p.star, x: free.x, y: free.y, anchor: free.anchor };
  });

  // Back into catalogue order, so rendering is stable regardless of brightness.
  return projected.map((p) => {
    const found = result.find((l) => l.star.name === p.star.name);
    if (!found) throw new Error(`${p.star.name} lost during label placement`);
    return found;
  });
}

/* ------------------------------------------------------------------------ */

/**
 * A four-pointed star, drawn as the eye reports a bright one rather than as a
 * lens records it.
 *
 * Worth being honest about: this is the one place the field is not photographic.
 * The plate the whole aesthetic is named after was made with a *refractor*, and
 * a refractor renders stars as round discs — diffraction spikes come from the
 * vanes holding a reflector's secondary mirror. Kept anyway, because at the size
 * these are drawn a disc reads as a bullet in a list and a star reads as a star,
 * and legibility outranks the metaphor. `glyph="disc"` is the photographic one.
 *
 * The waist is what makes it a star rather than a plus sign: the curve between
 * two tips bows in almost to the centre, so the arms taper instead of meeting at
 * a square shoulder.
 */
export function starPath(cx: number, cy: number, r: number): string {
  const w = r * 0.11;
  const n = (v: number) => v.toFixed(2);
  return (
    `M${n(cx)} ${n(cy - r)}` +
    `Q${n(cx + w)} ${n(cy - w)} ${n(cx + r)} ${n(cy)}` +
    `Q${n(cx + w)} ${n(cy + w)} ${n(cx)} ${n(cy + r)}` +
    `Q${n(cx - w)} ${n(cy + w)} ${n(cx - r)} ${n(cy)}` +
    `Q${n(cx - w)} ${n(cy - w)} ${n(cx)} ${n(cy - r)}Z`
  );
}

/**
 * A plain round dot — what a refractor actually records, and the alternative to
 * `starPath` above.
 *
 * Emitted as a path rather than a `<circle>` so the two glyphs are
 * interchangeable everywhere without the call site knowing which it asked for.
 */
export function discPath(cx: number, cy: number, r: number): string {
  const n = (v: number) => v.toFixed(2);
  return (
    `M${n(cx - r)} ${n(cy)}` +
    `a${n(r)} ${n(r)} 0 1 0 ${n(r * 2)} 0` +
    `a${n(r)} ${n(r)} 0 1 0 ${n(-r * 2)} 0Z`
  );
}
