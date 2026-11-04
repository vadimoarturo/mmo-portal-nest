# Player auctions

Gold listing validation, seller/buyer ownership, conditional lifecycle changes, and atomic settlement.

[API guide](../../../README.md) · [DDD design](../../../../../docs/DDD.md)

## Responsibilities by layer

| Layer | Implementation |
| --- | --- |
| Domain | `AuctionLot` validates listing amounts, self-purchase restrictions, active state, and cancellation ownership; `TradingEligibility` enforces character/storage/offline rules. |
| Application | `AuctionService` coordinates reservation, purchase, and cancellation through account, wallet, game, repository, query, and Unit of Work ports. |
| Infrastructure | `PrismaAuctionRepository` persists conditional transitions; `AuctionQueries` builds paginated active/own-lot projections. |
| Presentation | Auction controller and DTOs retain the established `/auction/*` routes. |

## Listing lifecycle

A listing reserves 1 million through 9 billion integer game gold and requires at least one portal credit. The seller must have a character, initialized game storage, and no online character. Gold reservation and listing creation share one transaction.

`active → completed` requires a different buyer. The scenario reads the lot, asks the domain to authorize the transition, checks the buyer's game state for the lot's server, and conditionally claims the active record. It then debits the buyer, credits the seller with an auction audit entry, and delivers gold to the buyer through the same context.

`active → canceled` requires the seller. The scenario conditionally claims the lot and returns reserved gold atomically. Completed/canceled lots cannot transition again.

## Concurrency

Domain validation operates on a snapshot. Repository state updates retain `status=active` predicates, so competing purchase/cancel operations cannot both claim a lot. No money or gold is transferred after a failed claim. A downstream delivery failure propagates to the Unit of Work.

## Verification

Tests cover ownership, terminal states, invalid gold/credit formats, exact transaction propagation, losing concurrent claims, self-purchases, and delivery failures.

## Local verification

From the repository root:

```bash
pnpm --dir apps/api exec jest --runInBand
pnpm --dir apps/api typecheck
```

Domain/application tests use local fixtures and external resource doubles. Runtime secrets belong in the ignored environment file, using `apps/api/.env.example` as the template.
