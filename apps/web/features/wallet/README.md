# Wallet web feature

The balance HTTP client queries the authenticated account through `/user/balance`. It shares the common transport and never supplies a caller-controlled account login. Monetary mutations remain API application scenarios.

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
