import { Prisma } from '@prisma/client';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { GameServerBase } from '../game-server-base.service';
import { InsertItemData, TopGuilds, TopPks, TopPlayers } from './type';
import { format } from 'sql-formatter';
import { GameServerName } from '#Common/enum';
import { HelperService } from '#Core/helper.service';

@Injectable()
export class MmoGameServerService extends GameServerBase implements OnModuleInit, OnModuleDestroy {
    protected serverName = GameServerName.MMO;
    protected logger = new Logger(MmoGameServerService.name);

    constructor(private readonly helperService: HelperService) {
        super();
    }

    async onModuleInit() {
        await this.connect();
    }

    async onModuleDestroy() {
        await this.disconnect();
    }

    private table(name: 'PaidItem' | 'Item', transaction?: Prisma.TransactionClient): Prisma.Sql {
        if (!transaction) {
            return Prisma.raw(`[dbo].[${name}]`);
        }
        const portal = process.env.DATABASE_URL ?? '';
        const game = process.env.DATABASE_URLMMO ?? '';
        const database = /;database=([A-Za-z_][A-Za-z0-9_]*)(?:;|$)/i.exec(game)?.[1];
        if (!database || portal.split(';')[0].toLowerCase() !== game.split(';')[0].toLowerCase()) {
            throw new Error('Portal and game databases must use the same SQL Server instance for atomic writes');
        }
        return Prisma.raw(`[${database}].[dbo].[${name}]`);
    }

    private integer(value: number) {
        if (!Number.isSafeInteger(value) || value <= 0) {
            throw new Error('Expected a positive integer');
        }
        return value;
    }

    async insertItem(data: InsertItemData, transaction?: Prisma.TransactionClient) {
        const entries = data.isSet
            ? (JSON.parse(data.gameItemSetId) as { id: number; count: number }[]).map((entry) => ({ ...entry, count: entry.count * data.count }))
            : [{ id: data.gameItemId, count: data.count }];
        if (!Array.isArray(entries) || entries.length === 0 || entries.length > 100) {
            throw new Error('Invalid item bundle');
        }
        const account = this.integer(data.accountId);
        const dateBuy = this.helperService.getStringTime(this.helperService.getServerTime());
        const validTime = this.helperService.getOneMonthTime(this.helperService.getServerTime());
        const table = this.table('PaidItem', transaction);
        const values = entries.map(({ id, count }) => {
            this.integer(id);
            this.integer(count);
            return Prisma.sql`(${id}, ${account}, ${this.serverName}, ${account}, ${id}, ${count}, ${count}, 'True', ${dateBuy}, ${dateBuy}, ${validTime}, ${validTime}, 'False')`;
        });
        const client = transaction ?? (await this.connect());
        return client.$executeRaw(Prisma.sql`
            INSERT INTO ${table}
            (buy_id, account_id, server_name, taken_account_id, item_code, item_count, rest_item_count, confirmed, confirmed_time, bought_time, valid_time, taken_time, isCancel)
            VALUES ${Prisma.join(values)}
        `);
    }

    async getTopPlayers(limit: number): Promise<TopPlayers[]> {
        const query = `
            SELECT TOP ${limit} c.name, c.job, c.lv, c.race, g.name as guildName, g.icon as guildIcon
            FROM Character c
            LEFT JOIN GuildMember gm ON c.sid = gm.player_id
            LEFT JOIN Guild g ON gm.guild_id = g.sid
            WHERE c.permission = 0 and c.name not like '@%'
            ORDER BY c.exp DESC;
        `;
        return (await this.selectQuery(format(query))) as unknown as TopPlayers[];
    }

    async getTopPks(limit: number): Promise<TopPks[]> {
        const query = `
            SELECT TOP ${limit} c.name, c.job, c.lv, c.race, g.name as guildName, g.icon as guildIcon, c.pkc
            FROM Character c
            LEFT JOIN GuildMember gm ON c.sid = gm.player_id
            LEFT JOIN Guild g ON gm.guild_id = g.sid
            WHERE c.permission = 0 and c.name not like '@%' and c.pkc > 0
            ORDER BY c.pkc DESC;
        `;
        return (await this.selectQuery(format(query))) as unknown as TopPks[];
    }

    async getTopGuilds(limit: number): Promise<TopGuilds[]> {
        const query = `
            SELECT TOP ${limit} g.name, g.icon, g.dungeon_id AS dungeons,
                   (SELECT COUNT(*) FROM GuildMember gm WHERE gm.guild_id = g.sid) AS players,
                   (SELECT TOP 1 c.name FROM Character c WHERE c.sid =
                       (SELECT gm.player_id FROM GuildMember gm WHERE gm.guild_id = g.sid AND gm.permission = 7)
                   ) AS leaders
            FROM Guild g
            ORDER BY dungeons DESC, players DESC
        `;
        return (await this.selectQuery(format(query))) as unknown as TopGuilds[];
    }

    async checkExistCharacter(accountId: number): Promise<boolean> {
        const query = `
            SELECT COUNT(*) as count FROM Character WHERE account_id = ${accountId}
        `;
        const result = await this.selectQuery(format(query));
        return result[0]?.count > 0;
    }

    async getOnlineCharacters(accountId: number): Promise<boolean> {
        const query = `
            SELECT COUNT(*) as count FROM Character WHERE account_id = ${accountId} AND DATEDIFF_BIG(second, login_time, logout_time) < 0
        `;
        const result = await this.selectQuery(format(query));
        return (result as any)[0]?.count > 0;
    }

    async getNameMaxLevelCharacter(accountId: number): Promise<string> {
        const query = `
            SELECT TOP 1 name FROM Character WHERE account_id = ${accountId} ORDER BY exp DESC
        `;
        return (await this.selectQuery(format(query)))[0]?.name;
    }

    async getBalanceInGame(accountId: number): Promise<number> {
        const query = `
            SELECT cnt FROM Item WHERE account_id = ${accountId} AND code = 0
        `;
        const result = (await this.selectQuery(format(query)))[0]?.cnt;
        return result;
    }

    async insertBalanceInGame(accountId: number, amount: number, transaction?: Prisma.TransactionClient) {
        this.integer(accountId);
        this.integer(amount);
        const client = transaction ?? (await this.connect());
        const table = this.table('Item', transaction);
        const affected = await client.$executeRaw(Prisma.sql`
            UPDATE ${table} SET cnt = cnt + ${amount} WHERE account_id = ${accountId} AND code = 0
        `);
        if (affected !== 1) {
            throw new Error('Game wallet not found or ambiguous');
        }
        return affected;
    }

    async removeBalanceInGame(accountId: number, amount: number, transaction?: Prisma.TransactionClient) {
        this.integer(accountId);
        this.integer(amount);
        const client = transaction ?? (await this.connect());
        const table = this.table('Item', transaction);
        const affected = await client.$executeRaw(Prisma.sql`
            UPDATE ${table} SET cnt = cnt - ${amount}
            WHERE account_id = ${accountId} AND code = 0 AND cnt >= ${amount}
        `);
        if (affected !== 1) {
            throw new Error('Insufficient game balance or wallet not found');
        }
        return affected;
    }
}
