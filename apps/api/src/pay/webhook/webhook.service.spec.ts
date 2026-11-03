import { Test, TestingModule } from '@nestjs/testing';
import { WebhookService } from './webhook.service';
import { BalanceService } from '#User/balance.service';
import { PrismaService } from '#Core/prisma/prisma.service';

describe('WebhookService', () => {
    let service: WebhookService;
    let balanceService: any;
    let prismaService: any;

    beforeEach(async () => {
        const mockBalanceService = {
            increment: jest.fn(),
        };

        const mockPrismaService = {
            payProvider: {
                findFirst: jest.fn(),
            },
            orderTransaction: {
                findFirst: jest.fn(),
                update: jest.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WebhookService,
                {
                    provide: BalanceService,
                    useValue: mockBalanceService,
                },
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<WebhookService>(WebhookService);
        balanceService = module.get(BalanceService);
        prismaService = module.get(PrismaService);
    });

    describe('calcAmountTotal', () => {
        it('должен правильно рассчитать сумму без бонуса', () => {
            const rate = '70';
            const amount = '100';
            const bonus = [];

            const result = (service as any).calcAmountTotal(rate, amount, bonus);

            expect(result).toBe('7000.00'); // 70 * 100 = 7000
        });

        it('должен правильно рассчитать сумму с одним бонусом', () => {
            const rate = '70';
            const amount = '100';
            const bonus = [{ amount: '5000', percent: '10' }];

            const result = (service as any).calcAmountTotal(rate, amount, bonus);

            expect(result).toBe('7700.00'); // 7000 + (7000 * 10/100) = 7000 + 700 = 7700
        });

        it('должен применить наибольший подходящий бонус', () => {
            const rate = '70';
            const amount = '200';
            const bonus = [
                { amount: '5000', percent: '5' },
                { amount: '10000', percent: '10' },
                { amount: '20000', percent: '15' },
            ];

            const result = (service as any).calcAmountTotal(rate, amount, bonus);

            expect(result).toBe('15400.00'); // 70*200=14000, бонус 10%, 14000 + 1400 = 15400
        });

        it('должен применить максимальный бонус при превышении всех порогов', () => {
            const rate = '70';
            const amount = '500';
            const bonus = [
                { amount: '5000', percent: '5' },
                { amount: '10000', percent: '10' },
                { amount: '20000', percent: '15' },
            ];

            const result = (service as any).calcAmountTotal(rate, amount, bonus);

            expect(result).toBe('40250.00'); // 70*500=35000, бонус 15%, 35000 + 5250 = 40250
        });

        it('должен не применять бонус если сумма недостаточна', () => {
            const rate = '70';
            const amount = '50';
            const bonus = [
                { amount: '5000', percent: '10' },
                { amount: '10000', percent: '15' },
            ];

            const result = (service as any).calcAmountTotal(rate, amount, bonus);

            expect(result).toBe('3500.00'); // 70*50=3500, бонус не применяется
        });

        it('должен корректно работать со строковыми числами', () => {
            const rate = '75.5';
            const amount = '100.5';
            const bonus = [{ amount: '5000', percent: '12.5' }];

            const result = (service as any).calcAmountTotal(rate, amount, bonus);

            expect(result).toBe('8536.22');
        });

        it('должен корректно обрабатывать нулевые значения', () => {
            const rate = '70';
            const amount = '0';
            const bonus = [{ amount: '1000', percent: '10' }];

            const result = (service as any).calcAmountTotal(rate, amount, bonus);

            expect(result).toBe('0.00');
        });

        it('должен корректно обрабатывать пустой массив бонусов', () => {
            const rate = '100';
            const amount = '200';
            const bonus = [];

            const result = (service as any).calcAmountTotal(rate, amount, bonus);

            expect(result).toBe('20000.00'); // 100 * 200 = 20000
        });

        it('должен выбрать последний подходящий бонус из массива', () => {
            const rate = '70';
            const amount = '14.9';
            const bonus = [
                { amount: '1', percent: '0' },
                { amount: '1000', percent: '10' },
                { amount: '5000', percent: '20' },
                { amount: '10000', percent: '30' },
            ];

            const result = (service as any).calcAmountTotal(rate, amount, bonus);

            // 70 * 14.9 = 1043, подходит бонус 10% (1043 >= 1000)
            expect(result).toBe('1147.30'); // 1043 + (1043 * 10/100) = 1043 + 104.3 = 1147.3
        });

        it('должен корректно округлять дробные значения', () => {
            const rate = '33.33';
            const amount = '99.99';
            const bonus = [{ amount: '3000', percent: '7.77' }];

            const result = (service as any).calcAmountTotal(rate, amount, bonus);

            // 33.33 * 99.99 = 3332.6667, бонус 7.77%, 3332.6667 + 258.944 = 3591.61
            expect(result).toBe('3591.61');
        });

        it('должен правильно работать с дробными процентами', () => {
            const rate = '50';
            const amount = '100';
            const bonus = [{ amount: '1000', percent: '0.5' }];

            const result = (service as any).calcAmountTotal(rate, amount, bonus);

            // 50 * 100 = 5000, бонус 0.5%, 5000 + 25 = 5025
            expect(result).toBe('5025.00');
        });
    });
});
