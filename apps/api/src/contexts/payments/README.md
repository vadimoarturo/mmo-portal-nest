# Payments and settlement

Payment quotes, provider requests, authenticated receipts, idempotent order settlement, and bonus policy.

[API guide](../../../README.md) · [DDD design](../../../../../docs/DDD.md)

## Responsibilities by layer

| Layer | Implementation |
| --- | --- |
| Domain | `PaymentOrder` matches receipts and gates settlement; `PaymentQuote` validates conversion/minimums; `BonusPolicy` computes the eligible bonus. |
| Application | `PayService` creates pending orders and requests payment links; `SettlePayment` coordinates conditional settlement with Wallet and Unit of Work. |
| Infrastructure | `PrismaPaymentRepository`, `ProviderPaymentGateway`, and provider-specific adapters implement persistence, IDs, and external requests. |
| Presentation | Controllers and webhook normalization validate provider status/test mode and pass a common receipt to the settlement use case. Provider callback guards implement each external signature/IP protocol. |

## Creation and receipt acceptance

Creation resolves an enabled provider, validates the requested credit amount and minimum, calculates a positive two-decimal USD quote, creates a `NEW` order, and calls the provider outside any SQL transaction. A browser return page cannot settle the order.

Authenticated callbacks become a `PaymentReceipt` containing order ID, provider, amount, currency, and optional provider transaction ID. `PaymentOrder.accept` checks all matching fields before acknowledging an already successful order. Unsupported order states are rejected.

## Settlement protocol

Within a single Unit of Work, reconstruct the order, accept its receipt, resolve bonus tiers, calculate exact credits, and conditionally claim `NEW → SUCCESS`. Only the successful claim credits Wallet and writes its audit entry. A repeated successful callback and a concurrent losing claim are acknowledged without another credit.

Bonus thresholds use the converted unrounded base. The highest eligible threshold wins regardless of configuration order. The final credit result rounds half-up to two decimal places. The domain arithmetic contains no Prisma dependency.

## Provider adapters

FreeKassa, AnyPay, and ENOT keep their creation/signature formats behind the integration boundary. AnyPay accepts paid non-test callbacks only; ENOT accepts successful callbacks and verifies canonical JSON HMAC-SHA256. DTOs and guards remain outside the domain/application layers.

## Verification

Tests cover mismatched amounts/currencies/providers, repeated/competing callbacks, shared transaction propagation, zero-rounded quotes, fractional percentages, rounding, tier order, and the public ENOT signature fixture.

## Local verification

From the repository root:

```bash
pnpm --dir apps/api exec jest --runInBand
pnpm --dir apps/api typecheck
```

Domain/application tests use local fixtures and external resource doubles. Runtime secrets belong in the ignored environment file, using `apps/api/.env.example` as the template.
