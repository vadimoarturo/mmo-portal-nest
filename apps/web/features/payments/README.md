# Payments web feature

The top-up dialog displays payment methods, collects a credit amount, and follows provider instructions from the payments API client. Only a signed provider receipt accepted by the backend can credit a wallet. Provider secrets never enter browser contracts.

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
