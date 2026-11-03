import { PrismaClient } from '@prisma/client';
import { GameServerName, ShopCategory, ShopItemLifeType } from '../../../src/common/enum';

export const shopSeed = async (prisma: PrismaClient) => {
    await prisma.shopCategory.upsert({
        where: { unique_shop_category: { category_id: ShopCategory.OTHER, server_name: GameServerName.MMO } },
        update: {},
        create: { category_id: ShopCategory.OTHER, server_name: GameServerName.MMO },
    });
    await prisma.shopItem.upsert({
        where: { item_id: 1 },
        update: {},
        create: {
            item_id: 1,
            is_active: false,
            icon: 'starter-pack',
            info: JSON.stringify({ en: 'Starter Pack', ru: 'Стартовый набор' }),
            category_id: ShopCategory.OTHER,
            server_name: GameServerName.MMO,
            price: '100',
            item_count: 1,
            is_stack: false,
            life_type: ShopItemLifeType.FOREVER,
            is_move: false,
            is_set: false,
        },
    });
};
