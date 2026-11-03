import { PrismaClient } from '@prisma/client';
import { gameServerSeed } from './seed/game-server.seed';
import { shopSeed } from './seed/shop';
import { paySeed } from './seed/pay';

const prisma = new PrismaClient();

async function main() {
    await gameServerSeed(prisma);
    await shopSeed(prisma);
    await paySeed(prisma);
}

main()
    .catch(() => {
        process.stderr.write('Seed failed. Check database connectivity and schema.\n');
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
