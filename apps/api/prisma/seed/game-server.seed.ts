import { GameServerName } from '../../src/common/enum';
import { PrismaClient } from '@prisma/client';

export async function gameServerSeed(prisma: PrismaClient) {
    const server = {
        server_name: GameServerName.MMO,
        is_active: true,
        rate: '1',
        drop: '1',
        version: 'generic-sql',
    };
    await prisma.gameServer.upsert({
        where: {
            server_name: GameServerName.MMO,
        },
        update: {
            ...server,
        },
        create: {
            ...server,
        },
    });
}
