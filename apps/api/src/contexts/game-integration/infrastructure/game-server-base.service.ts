import { PrismaClient } from '@prisma/client';
import { Logger } from '@nestjs/common';
import { InsertItemData } from '#Root/contexts/game-integration/infrastructure/version/type';
import { GameServerName } from '#Root/shared/domain/enum/index';

export abstract class GameServerBase {
    protected serverName: GameServerName;
    protected logger: Logger;
    protected prisma: PrismaClient | null = null;

    protected async connect(): Promise<PrismaClient> {
        if (this.prisma) {
            return this.prisma;
        }
        const urlKey = `DATABASE_URL${this.serverName}`;
        const urlConnect = process.env[urlKey];
        this.prisma = new PrismaClient({
            datasources: {
                db: {
                    url: urlConnect,
                },
            },
        });
        await this.prisma.$connect();
        return this.prisma;
    }

    protected async disconnect(): Promise<void> {
        if (this.prisma) {
            await this.prisma.$disconnect();
            this.prisma = null;
        }
    }

    protected async selectQuery(query: string) {
        try {
            return await this.prisma.$queryRawUnsafe(query);
        } catch (err) {
            this.logger.error(`Не удалось отправить запрос в БД игрового сервера в связи с ошибкой: ${err}`);
            throw new Error(err);
        }
    }

    protected async executeQuery(query: string) {
        try {
            return await this.prisma.$executeRawUnsafe(query);
        } catch (err) {
            this.logger.error(`Не удалось отправить запрос в БД игрового сервера в связи с ошибкой: ${err}`);
            throw new Error(err);
        }
    }

    public abstract insertItem(data: InsertItemData): Promise<number>;
}
