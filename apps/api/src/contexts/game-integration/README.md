# Game anti-corruption layer

Translation from portal item/gold operations to the configured game schema and shared SQL transaction.

[API guide](../../../README.md) · [DDD design](../../../../../docs/DDD.md)

## Responsibilities by layer

| Layer | Implementation |
| --- | --- |
| Application | `GamePort` defines delivery, gold reservation/credit, character state, and display-name queries without exposing game tables. |
| Infrastructure | `GameGateway` unwraps transaction contexts and delegates to the configured game service. The SQL implementation owns table mappings, catalog validation, parameter binding, bundles, and rankings. |

## Integration contract

Portal and GameWorld must use the same SQL Server instance. Game mutations use the portal transaction client with fully qualified validated catalog names, so catalog purchase history, wallet changes, auction state, and game writes commit together. Cross-instance mutations are rejected.

The adapter expects operator-managed Character, GuildMember, Guild, Item, and PaidItem tables. Accounts require initialized game wallet storage and matching portal/game account IDs. See the [game database contract](../../../../../docs/ARCHITECTURE.md#game-database-contract) for columns and semantics.

`GamePort` is the anti-corruption boundary: catalog and auction applications know delivery quantities, gold, account IDs, and server IDs, while the adapter knows game row conventions and inventory queues. Supporting ranking queries remain in this integration layer.

## Extending an integration

Implement the application contract for a new game backend and register its gateway/service mapping at composition. Preserve atomic write behavior, validated identifiers, bound SQL values, bounded positive counts, and offline/storage rules. A separate database instance would require a new consistency protocol rather than silently bypassing the existing Unit of Work.

## Verification

Adapter tests cover catalog safety, same-instance enforcement, transaction-aware item/gold writes, and invalid bundle/count handling. No game database is included in the public repository.

## Local verification

From the repository root:

```bash
pnpm --dir apps/api exec jest --runInBand
pnpm --dir apps/api typecheck
```

Domain/application tests use local fixtures and external resource doubles. Runtime secrets belong in the ignored environment file, using `apps/api/.env.example` as the template.
