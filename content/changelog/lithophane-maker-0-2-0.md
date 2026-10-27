---
project: 'lithophane-maker'
version: '0.2.0'
date: 2026-10-27
headline: 'Five identical panels, a lid that holds without fragile snaps, and simpler settings tuned by real test prints.'
breaking: false
---

### Design

- **Every panel is the same 81 mm square** with a 5 mm border held in a groove on all four sides, so all five faces are framed alike. The top panel no longer has notched corners and prints standing up like the others.
- **The top panel rests on four small corner supports** and the lid traps it from above, so nothing falls out if the cube is tipped.
- **The lid attaches with printed press-fit pegs or glued magnets.** The tiny snap ridges, which slicers couldn't print, are gone.
- **The frame is sized automatically** to fit the grooves and the pegs or magnets, with 2.4 mm walls at every size.
- **Panels export standing up,** for smooth shading with no infill grid.

### Settings

- **Defaults from test prints:** groove clearance 0.20 mm, peg clearance 0.10 mm.
- **Fewer, clearer settings,** grouped as Cube, Lid, Fit and Lithophane, with nothing that conflicts. Panel thickness follows Max thickness.
- **Resolution in pixels per mm** (higher = finer), with warnings when it's coarse, finer than a 0.4 mm nozzle, or makes very large files. Large cubes now really get the detail you ask for.
- **Each photo has its own settings:** the Edit button on a photo crops it and adjusts brightness, contrast, sharpening and more, with a live preview.

### Also

- Every download records the settings it was made with, in `README.txt` and `settings.json`.
- The layout works on phones.
- The printing guide is part of the site, at [/guide](https://lithophane-maker.merope.dev/guide/).
- A link preview image and icons for sharing.
- Fixed: a crash when dragging the crop box quickly; photo thumbnails now show the crop.
