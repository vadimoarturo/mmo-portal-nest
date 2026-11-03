import { PayProviders } from '../../../src/common/enum';
import { PrismaClient } from '@prisma/client';

export const payProviderSeed = async (prisma: PrismaClient) => {
    await prisma.payProvider.upsert({
        where: {
            provider: PayProviders.FREEKASSA,
        },
        update: {
            icon: 'freekassa',
            min: '70',
            rate: '70',
            haveCommission: true,
        },
        create: {
            provider: PayProviders.FREEKASSA,
            is_active: false,
            icon: 'freekassa',
            min: '70',
            rate: '70',
            haveCommission: true,
            bonus: {
                createMany: {
                    data: [
                        {
                            amount: '1',
                            percent: '0',
                        },
                        {
                            amount: '2000',
                            percent: '10',
                        },
                        {
                            amount: '5000',
                            percent: '20',
                        },
                        {
                            amount: '10000',
                            percent: '25',
                        },
                    ],
                },
            },
        },
    });

    await prisma.payProvider.upsert({
        where: {
            provider: PayProviders.ANYPAY,
        },
        update: {
            icon: 'anypay',
            min: '70',
            rate: '70',
            haveCommission: true,
        },
        create: {
            provider: PayProviders.ANYPAY,
            is_active: false,
            icon: 'anypay',
            min: '70',
            rate: '70',
            haveCommission: true,
            bonus: {
                createMany: {
                    data: [
                        {
                            amount: '1',
                            percent: '0',
                        },
                        {
                            amount: '2000',
                            percent: '10',
                        },
                        {
                            amount: '5000',
                            percent: '20',
                        },
                        {
                            amount: '10000',
                            percent: '25',
                        },
                    ],
                },
            },
        },
    });

    await prisma.payProvider.upsert({
        where: {
            provider: PayProviders.ENOT,
        },
        update: {
            icon: 'spb',
            min: '70',
            rate: '70',
            haveCommission: true,
        },
        create: {
            provider: PayProviders.ENOT,
            is_active: false,
            icon: 'spb',
            min: '70',
            rate: '70',
            haveCommission: true,
            bonus: {
                createMany: {
                    data: [
                        {
                            amount: '1',
                            percent: '0',
                        },
                        {
                            amount: '2000',
                            percent: '10',
                        },
                        {
                            amount: '5000',
                            percent: '20',
                        },
                        {
                            amount: '10000',
                            percent: '25',
                        },
                    ],
                },
            },
        },
    });
};
export const paySeed = async (prisma: PrismaClient) => {
    await payProviderSeed(prisma);
};
