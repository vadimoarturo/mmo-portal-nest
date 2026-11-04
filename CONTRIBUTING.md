# Contributing to mmo-portal

Keep changes focused on a concrete behavior and include the corresponding API, frontend contract, and documentation updates. The project uses TypeScript, Node.js 22, and pnpm 9.4.0.

## Setup

Follow the [root setup guide](README.md#local-setup). Unit tests do not need a database, Redis, SMTP, or provider account. Copy environment examples only when running the application against your own services.

Each application owns its lockfile. Use frozen installs for reproducible checks and commit the updated lockfile when intentionally changing dependencies.

## Before opening a change

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm audit:prod
pnpm check:release
```

Use the feature's actual risks to choose tests. Financial and authentication changes should cover invalid input, authorization, competing claims/repeated callbacks, and transaction client propagation. Verify both language variants when modifying player-facing content.

## Domain conventions

- Portal credits cross the HTTP boundary as decimal strings. Game gold uses integer strings.
- Monetary calculations use the domain `Money` value object and isolated `decimal.js` arithmetic; SQL wallet updates specify fixed precision and sufficient-funds conditions.
- Pass the same opaque `TransactionContext` through application ports for every participating wallet, order, and game write. Only infrastructure unwraps Prisma.
- Keep game SQL inside the game adapter. Bind SQL values and validate dynamic identifiers.
- Keep request identity in authenticated server context; never trust a caller-provided account login for settlement.
- Keep credentials, cookies, tokenized links, and message bodies out of logs and screenshots.

Domain models may depend on shared domain primitives. Application code depends on its domain and declared ports; cross-context application imports must target a public `.port.ts` contract. Keep Nest decorators, Prisma types, Redis, provider signatures, and HTTP validation in adapters or composition roots. Run the architecture and composition tests whenever changing module boundaries. Read the [DDD design guide](docs/DDD.md) before adding a new context.

## Reviewable commits

Use a clear imperative subject that explains the change. Group related code and tests coherently, and keep generated documentation assets with their source changes. Do not commit dependencies, build output, environment files, backups, certificates, or operational media.

Pull requests should describe the trigger, resulting behavior, verification performed, and any deployment/configuration changes. Schema changes must include a migration and an explanation of the rollout order.

## Documentation and images

All repository documentation is written in English. SVG sources live in `scripts/generate-diagrams.py`; PNG previews are reproduced through the capture script with fictional data. Never use real account or payment records as documentation fixtures.
