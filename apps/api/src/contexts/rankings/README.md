# Public ranking projections

Cached public player, competitive, and guild leaderboard queries.

[API guide](../../../README.md) · [DDD design](../../../../../docs/DDD.md)

## Responsibilities by layer

| Layer | Implementation |
| --- | --- |
| Application | `RankingsReadPort` defines public read records; `Rankings` is the framework-independent query facade. |
| Infrastructure | The scheduled projection adapter queries the game service on startup/every ten minutes and caches results. |
| Presentation | The controller exposes `/top/players`, `/top/pks`, and `/top/guilds`. |

## Read model

Rankings are supporting read projections with no write aggregate. Player records include character/race/class/level and guild display metadata. Competitive records add the score. Guild records include dungeon/member counts and a string of leader names.

The adapter owns cache keys and scheduled refreshes. It translates game query results to application-facing records; the UI renders these records through its Rankings feature. No leaderboard response contains account credentials or private session data.

## Composition and checks

The context module binds the application facade to its projection adapter. Architecture tests keep application contracts independent of NestJS, Redis, and the game SQL implementation; composition tests resolve the actual context graph without live services. The browser preview uses clearly marked fictional ranking fixtures.

## Local verification

From the repository root:

```bash
pnpm --dir apps/api exec jest --runInBand
pnpm --dir apps/api typecheck
```

Domain/application tests use local fixtures and external resource doubles. Runtime secrets belong in the ignored environment file, using `apps/api/.env.example` as the template.
