# Identity and access

Account registration, verification, credential changes, session metadata, token issuance, and a limited account lookup contract.

[API guide](../../../README.md) · [DDD design](../../../../../docs/DDD.md)

## Responsibilities by layer

| Layer | Implementation |
| --- | --- |
| Domain | `Account` validates login/email/password registration, verification state, and credential-version prerequisites for recovery. |
| Application | `AuthService` coordinates repository, credential, token, and notification ports. `UserService` exposes `AccountsPort` without exporting persistence records. |
| Infrastructure | `PrismaIdentityRepository`, `BcryptCredentials`, `JwtTokenService`, `QueuedIdentityNotifications`, and `AccountQueries` implement the ports. |
| Presentation | The account controller owns cookies and DTO validation; guards own token purposes and request authentication. |

## Account lifecycle

Registration validates a 4–15 character alphanumeric login and an 8–64 character printable ASCII password. It creates bcrypt portal/game hashes, a random referral code, session metadata, and an account blocked until email verification. Verification returns the access-state changes permitted by the domain model.

Password reset binds the link to a fingerprint of the existing hash. The domain checks the fingerprint before accepting a replacement. The repository updates only the expected old hash, so concurrent recovery requests cannot reuse the same link. JWT access/refresh verification checks the current credential fingerprint and refreshes current email verification state.

## Ports and ownership

`IdentityRepository` owns account persistence. `CredentialPort` owns hashing, comparison, fingerprinting, and random referral codes. `TokenPort` signs purpose-specific tokens. `IdentityNotifications` queues verification/recovery mail through an adapter; the application contains no SMTP, Bull, JWT SDK, or bcrypt import.

`AccountsPort` exposes only the fields needed by commerce, including the game account ID. Wallet owns credit mutation even though balance fields share the existing user table. The Identity module exports the account application facade and JWT adapter for HTTP guard composition.

## Verification

Domain tests cover registration policy, activation, repeated verification, and stale reset versions. Recovery tests exercise real bcrypt through the Prisma adapter double. JWT tests cover current credentials, token purposes, and revocation. No real email is sent.

## Local verification

From the repository root:

```bash
pnpm --dir apps/api exec jest --runInBand
pnpm --dir apps/api typecheck
```

Domain/application tests use local fixtures and external resource doubles. Runtime secrets belong in the ignored environment file, using `apps/api/.env.example` as the template.
