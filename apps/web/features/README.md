# Context-aligned web features

Feature folders mirror the API's user-facing bounded contexts. The web client composes their presentation components and HTTP clients; the API owns domain decisions and settlement.

[Web guide](../README.md) · [DDD design](../../../docs/DDD.md#web-client-boundary)

| Feature | Responsibility |
| --- | --- |
| Identity | Sign-in/up dialogs, email verification, password recovery, account HTTP contracts |
| Wallet | Current portal balance request |
| Catalog | Category/product browsing, purchase confirmation, catalog contracts |
| Auctions | Active/own listings, create/buy/cancel dialogs and requests |
| Payments | Top-up dialog, available payment methods, payment creation |
| Rankings | Leaderboard tabs and public ranking requests |

`presentation/` contains applicable React views. `infrastructure/api.ts` owns that feature's endpoint calls. `contracts/` owns request/response types. Shared Axios transport, providers, inputs, modal shell, localization, and layouts stay in their common locations.

Application routes import feature views, while shared layout components compose several features. Browser state reflects API responses. A payment return route displays feedback; only the authenticated backend receipt settles credits. Prices, ownership, funds, and lot state are always validated on the server.

Run `pnpm --dir apps/web lint`, `pnpm --dir apps/web typecheck`, and `pnpm --dir apps/web build` from the repository root. The preview capture exercises desktop/mobile layout with synthetic leaderboard data.
