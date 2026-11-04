# Shared kernel and boundaries

The shared domain kernel contains `Money`, domain failures, authentication failure vocabulary, and business enums. These are framework-independent primitives used across bounded contexts.

[API guide](../../README.md) · [DDD design](../../../../docs/DDD.md)

`application/transaction.ts` defines `UnitOfWork` and an opaque transaction identity. It contains no Prisma client or database-specific API. A caller passes this identity unchanged to participating ports.

HTTP helpers are separate from domain/application primitives: cookie names, authenticated request extraction, exception-to-response mapping, and request timing belong to their dedicated transport folders. They are not imported into domain models or application scenarios.

Architecture tests protect domain/application imports and the kernel's independence. Add a shared primitive only when its meaning is the same across collaborating contexts; otherwise keep the concept inside its owning context.
