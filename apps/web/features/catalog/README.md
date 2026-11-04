# Catalog web feature

The shop view and purchase dialog browse active products and submit item/server/count selections. The catalog API client owns `/shop/*` requests. The server chooses the effective price, validates quantities, debits credits, and delivers items atomically.

[Feature structure](../README.md) · [Web guide](../../README.md) · [DDD design](../../../../docs/DDD.md#web-client-boundary)

## Boundaries

The feature's `infrastructure/api.ts` uses the shared request transport for URL construction, cookie credentials, and errors. Applicable `contracts/` define HTTP shapes and `presentation/` contains React views. Shared controls and localization are reused rather than duplicated.

The backend is authoritative for domain invariants. No Prisma client, API aggregate, provider secret, or game SQL is imported into the web application.

## Verification

```bash
pnpm --dir apps/web lint
pnpm --dir apps/web typecheck
pnpm --dir apps/web build
```

Run these commands from the repository root. Validate English/Russian routes and desktop/mobile presentation when changing visible behavior.
