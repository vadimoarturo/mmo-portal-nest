# Platform adapters

Shared runtime adapters provide validated configuration, the Prisma connection lifecycle, Redis cache access, and the Bull/SMTP notification worker. Business decisions belong to the bounded contexts.

[API guide](../../README.md) · [DDD design](../../../../docs/DDD.md)

`prisma/unit-of-work.ts` implements the application's `UnitOfWork` interface. It creates a `PrismaTransactionContext` and checks the concrete type before unwrapping its client. Repository/game adapters use this helper; application code only forwards the opaque context.

`config/` validates startup environment values. `cache/` owns Redis serialization and invalidation. `queue/` registers the shared queue name, retries failed mail delivery with bounded exponential backoff, renders local Handlebars templates, and excludes message content/tokenized links from logs.

Nest module assembly lives in `bootstrap/` and context composition roots. The public container copies the compiled email assets under `dist/src/platform/queue/mail/`; no private environment file is part of the image.
