# Portal wallet

Exact credit transfers, balance snapshots, sufficient-funds checks, and top-up audit persistence.

[API guide](../../../README.md) · [DDD design](../../../../../docs/DDD.md)

## Responsibilities by layer

| Layer | Implementation |
| --- | --- |
| Domain | `WalletBalance` restores nonnegative balances and enforces available funds. Shared `Money` validates exact transfer values. |
| Application | `BalanceService` implements `WalletPort` and joins an existing transaction or starts a Unit of Work. |
| Presentation | The wallet controller preserves `/user/balance`; identity guards authenticate the caller. |
| Infrastructure | `PrismaWalletRepository` performs conditional fixed-precision updates and records the actual SQL before/after values. |

## Consistency contract

`WalletPort.increment` accepts the `pay`, `auction`, or `refund` origin; `decrement` performs an atomic spend. Values are decimal strings. A single transfer is positive, has at most two decimal digits, and is bounded at 9 billion credits. Persisted balances have the larger SQL `DECIMAL(19, 2)` range.

When a caller supplies `TransactionContext`, Wallet uses it directly. Without a context, it starts its own Unit of Work. Purchase, auction, and payment scenarios always provide their context so order changes and game delivery share the same commit.

The debit SQL includes a sufficient-funds predicate. The credit SQL uses `OUTPUT deleted.current_balance, inserted.current_balance`; these actual values are written to the top-up audit record within the transaction. A read-time funds check is advisory; the conditional write is authoritative under concurrency.

## Verification

Tests cover invalid amounts, fractional credits, true previous balances, insufficient funds, and joining an existing transaction. Shared Money tests distinguish balance range from per-transfer limits.

## Local verification

From the repository root:

```bash
pnpm --dir apps/api exec jest --runInBand
pnpm --dir apps/api typecheck
```

Domain/application tests use local fixtures and external resource doubles. Runtime secrets belong in the ignored environment file, using `apps/api/.env.example` as the template.
