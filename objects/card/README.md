# The card

A business card in the site's `sky` theme, printed: a dark card, the Pleiades
raised off it in pale filament, Merope circled in grease-pencil red, and a QR
code to `contact.merope.dev` set in a small patch of plate.

Nothing on it is hand-placed. `pnpm card:data` writes `data.scad` from
`src/lib/merope.ts` (the nine and Merope's coordinates), `src/lib/field.ts` (the
Gaia stars around them), `src/app/icon.svg` (the ring) and the QR encoder.
`card.scad` is the layout. If the lore, the field or the mark change, regenerate.

## Building

```sh
pnpm card:data
flatpak run --command=openscad org.openscad.OpenSCAD -o objects/card/out/card.stl objects/card/card.scad
```

About 20 seconds. The preview is the same command with `-o out/top.png
--camera=42.5,27.5,0,0,0,0,175 --projection=o`, plus `--socket=x11` after
`flatpak run` — without a display the offscreen renderer asserts and exits.

**The QR code is checked by reading it back off the render**, not by trusting the
encoder: decode `out/top.png` with any scanner and it should say
`HTTPS://CONTACT.MEROPE.DEV`. Do this again after touching the patch, the module
size or the quiet zone.

## Why the QR code is a pale patch

A pale-on-dark code is inverted, and not every scanner reads inverted codes. So
the patch is raised in the pale filament and the dark modules are cut through it
to the card below: ordinary dark-on-light, set into a dark card — the plate and
the sky side by side, as on the theme toggle.

It encodes in capitals because scheme and host are case-insensitive and capitals
fit QR's alphanumeric mode, which gets this URL into a 25×25 symbol at
error-correction level Q. Modules are 0.9mm: two nozzle widths, so every one
prints as at least two lines.

`contact.merope.dev` is printed and cannot be changed. It is meant to be a
redirect configured in Vercel; it has to exist before the first card leaves the
house, and keep existing after.

## Printing

Elegoo Neptune 4 Pro, 0.4mm nozzle, one extruder, filament swapped by hand.

| Z (mm)    | Filament | What                                     |
| --------- | -------- | ---------------------------------------- |
| 0 – 1.6   | dark     | the card                                 |
| 1.6 – 2.0 | pale     | stars, text, rule, QR patch, ring's foot |
| 2.0 – 2.4 | red      | the ring's top two layers                |

- **Layer height 0.2mm, first layer 0.2mm.** Every height above is a whole
  number of layers, so each swap lands on a boundary.
- **Two pauses**, added in the slicer's layer view: before the layer that ends
  at **Z 1.8** (first pale layer) and before the layer that ends at **Z 2.2**
  (first red layer). Use the slicer's _pause_ rather than _colour change_ unless
  `printer.cfg` defines an `M600` macro. At each pause, unload, load, and purge
  until the new colour runs clean before resuming — a pale star with a grey
  first layer is the usual failure.
- **100% infill.** The card is mostly floor and roof anyway, and solid is what
  makes it feel like an object rather than a print.
- **Arachne walls** (OrcaSlicer's default). The small monospace lines are close
  to one extrusion width and the classic generator drops strokes.
- **Textured PEI plate.** The plate only touches the back: textured gives it a
  matte grain that hides the first layer and fingerprints, and matches the
  front; smooth gives a gloss back that shows every scratch. Let it cool fully
  before flexing the card off.
- **Filament:** matte PLA if you have it — gloss reads as plastic, matte reads as
  print. Black or a deep navy, a cool white, and a brick red rather than a
  fire-engine one (the site's `--mark` is `#bf3d27`).

Below the ring's red top it is pale for two layers; from the side that shows
as a thin band. Accepted, because the alternative — a ring that starts in the
air at Z 2.0 — cannot be printed.
