---
project: 'chessmark'
version: '0.9.1'
date: 2026-10-20
headline: 'A spectator no longer holds a lock on games.'
breaking: false
---

**A spectator no longer holds a lock on `games`.** The 0.9.0 migration failed on its lock timeout
with every worker drained, behind the live view of a game.

### Fixed

- **The live game stream lets go of the database once it has caught a reader up.** It read the
  missed events and then kept that transaction open, idle, for as long as the tab stayed open:
  ACCESS SHARE on `games` and `game_events`, and one of the API's 30 pooled connections, per
  viewer. Nothing after that read touches the database — the live half is Redis alone — so the
  session is now closed there. The lock blocked any `ALTER TABLE` on either table, which is how
  the 0.9.0 deploy failed; the connections would have run the pool dry at about 30 viewers per API
  process.

**Deploying from before 0.9.1 needs the API stopped first**, because `deploy` migrates while the
old API is still serving: `docker compose -f docker-compose.yml -f docker-compose.prod.yml stop
  api`, then `./chessmark deploy`, which starts it again. From 0.9.1 on, `deploy` alone.

Published, not deployed: production changes when `./chessmark deploy` is run on the server. To run exactly this release: `./chessmark deploy v0.9.1`.
