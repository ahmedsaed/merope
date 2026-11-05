---
project: 'pleione'
version: '2.0.0'
date: 2026-11-01
headline: 'The first release as Pleione: Restart for movies and catch-up, Continue Watching that resumes a series, and Live loaded through the Xtream Player API.'
breaking: false
---

### Added

- A Restart button for movies, episodes and catch-up.
- Continue Watching resumes a series at its last played episode, with the
  series' own artwork. Hold OK on a title to remove it.
- The audio and subtitle tracks show as labeled pills in the player.
- A buffering spinner over movies, episodes and catch-up.

### Changed

- Xtream Live channels load from the Player API, and each account signs in
  once per session.
- Episodes are named in the interface language.

### Fixed

- A movie or episode that fails to start is retried before an error is shown.
