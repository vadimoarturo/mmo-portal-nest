# Catalog and checkout

Available products, category/item projections, price/quantity rules, purchase history, and item delivery.

[API guide](../../../README.md) · [DDD design](../../../../../docs/DDD.md)

## Responsibilities by layer

| Layer | Implementation |
| --- | --- |
| Domain | `Product` quotes a purchase from its selected unit price, stackability, bundle size, and count. |
| Application | `ShopService` coordinates checkout through catalog, account, wallet, game, and Unit of Work ports; read methods delegate to `CatalogReadPort`. |
| Infrastructure | `PrismaCatalogRepository` loads enabled products and stores purchase records; `CatalogQueries` caches HTTP-ready read projections. |
| Presentation | Shop controller and decorated DTOs preserve `/shop/category`, `/shop/items`, and `/shop/buy`. |

## Checkout protocol

Validate a safe integer quantity from 1 through 1000, resolve the account, and start one Unit of Work. The repository filters inactive products, servers, and categories. `Product.quote` restricts non-stackable items to one purchase, selects the sale price when present, multiplies exact Money, and validates the final delivery quantity.

The scenario debits Wallet, records the purchase's unit/total prices and actual balance context, and calls `GamePort.deliver` with the same transaction context. Any exception aborts the transaction. The game integration adapter handles bundles and SQL item delivery details.

## Read projections

Catalog queries return plain application read contracts and cache categories/pages in Redis. Projection cache entries are invalidated when the adapter starts and stops. A checkout always reloads the active product from SQL; displayed cached data never authorizes a purchase.

## Verification

Domain tests cover sale prices, bundles, stackability, and invalid delivery counts. Application/adapter tests cover exact fractional totals, unavailable items, invalid quantities, purchase history, and one shared transaction for debit/delivery.

## Local verification

From the repository root:

```bash
pnpm --dir apps/api exec jest --runInBand
pnpm --dir apps/api typecheck
```

Domain/application tests use local fixtures and external resource doubles. Runtime secrets belong in the ignored environment file, using `apps/api/.env.example` as the template.
