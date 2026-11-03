import { MmoGameServerService } from './game-server-mmo.service';

describe('MMO SQL adapter', () => {
    const saved = { ...process.env };
    afterEach(() => {
        process.env = { ...saved };
    });
    const helper = { getServerTime: () => new Date('2026-01-01'), getStringTime: () => '2026-01-01', getOneMonthTime: () => '2026-02-01' };
    const make = () => new MmoGameServerService(helper as never);
    beforeEach(() => {
        process.env.DATABASE_URL = 'sqlserver://localhost:1433;database=Portal';
        process.env.DATABASE_URLMMO = 'sqlserver://localhost:1433;database=GameWorld';
    });
    it('uses bound parameters and qualifies the game catalog in a shared transaction', async () => {
        const tx = { $executeRaw: jest.fn().mockResolvedValue(1) };
        await make().removeBalanceInGame(7, 100, tx as never);
        const query = tx.$executeRaw.mock.calls[0][0];
        expect(query.sql).toContain('[GameWorld].[dbo].[Item]');
        expect(query.sql).toContain('cnt >= ?');
        expect(query.values).toEqual([100, 7, 100]);
    });
    it('rejects writes across different SQL Server instances', async () => {
        process.env.DATABASE_URLMMO = 'sqlserver://other-host:1433;database=GameWorld';
        await expect(make().insertBalanceInGame(7, 100, {} as never)).rejects.toThrow('same SQL Server');
    });
    it('fails when no game wallet was updated', async () => {
        const tx = { $executeRaw: jest.fn().mockResolvedValue(0) };
        await expect(make().removeBalanceInGame(7, 100, tx as never)).rejects.toThrow('Insufficient');
    });
    it.each([-1, 0, 1.5, NaN])('rejects invalid game amount %s before SQL execution', async (amount) => {
        const tx = { $executeRaw: jest.fn() };
        await expect(make().insertBalanceInGame(7, amount, tx as never)).rejects.toThrow();
        expect(tx.$executeRaw).not.toHaveBeenCalled();
    });
});
