import { discPath, starPath } from '@/lib/sky';

/**
 * How a star is drawn, everywhere on the site.
 *
 * One switch rather than a prop, because the cluster in the hero and the field
 * behind the page are the same kind of object seen at two scales — if they ever
 * disagree about what a star looks like, the page has two star systems in it.
 * Flip this and both surfaces change together.
 *
 * The honest option is `disc`. The plate the whole aesthetic is named after was
 * made with a 13-inch refractor, and a refractor renders stars as round discs;
 * diffraction spikes come from the vanes holding a reflector's secondary mirror,
 * which the Henrys did not have. `star` is the legible option — at the sizes
 * these are drawn a disc can read as a bullet in a list.
 */
export const STAR_SHAPE: 'star' | 'disc' = 'disc';

/**
 * Radius multiplier, applied to the magnitude radius before drawing.
 *
 * The two glyphs are matched by weight rather than by extent: a star's arms
 * taper almost to nothing, so it carries roughly a third of the ink of a disc
 * reaching the same distance. Drawing both at the same radius would make the
 * disc version twice as heavy, which would be comparing the size rather than
 * the shape.
 */
const SCALE = { star: 1.15, disc: 0.58 } as const;

export const GLYPH_SCALE = SCALE[STAR_SHAPE];

/** The active glyph, as a path, centred on `cx, cy`. */
export function glyphPath(cx: number, cy: number, r: number): string {
  return STAR_SHAPE === 'star' ? starPath(cx, cy, r) : discPath(cx, cy, r);
}
