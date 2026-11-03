import { ApiError } from '#Common/exception/error.exception';
import { GameServerFactory } from '#GameServer/game-server.factory';
import { PrismaService } from '#Core/prisma/prisma.service';
import { ShopCategoryGetDTO } from './dto/shop-category.dto';
import { ShopItemsDTO } from './dto/shop-items.dto';
import { ShopItemsGetDTO } from './dto/shop-items.dto';
import { Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { UserService } from '#User/user.service';
import { IBuyShopItem } from './type';
import { ErrorCodeClient, ShopCategory, ShopItemLifeType } from '#Common/enum';
import { CacheService } from '#Core/cache/cache.service';
import { BalanceService } from '#User/balance.service';

@Injectable()
export class ShopService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly gameServerFactory: GameServerFactory,
        private readonly userService: UserService,
        private readonly cacheService: CacheService,
        private readonly balanceService: BalanceService,
    ) {}

    public static readonly cacheKeys = 'shop';

    async buyShopItem({ login, itemId, count, serverName }: IBuyShopItem) {
        if (!Number.isSafeInteger(count) || count < 1 || count > 1000) {
            throw new ApiError({ type: 'CLIENT', code: ErrorCodeClient.SHOP_BUY_LIMIT_COUNT });
        }
        const { account_id: accountId } = await this.userService.checkUser(login);
        return this.prisma.$transaction(async (tx) => {
            const item = await tx.shopItem.findFirst({
                where: { item_id: itemId, server_name: serverName, is_active: true, game_server: { is_active: true }, shop_category: { is_active: true } },
            });
            if (!item) {
                throw new ApiError({ type: 'CLIENT', code: ErrorCodeClient.SHOP_NOT_FOUND_ITEM });
            }
            if (!item.is_stack && count > 1) {
                throw new ApiError({ type: 'CLIENT', code: ErrorCodeClient.SHOP_BUY_LIMIT_COUNT });
            }
            const price = item.sale || item.price;
            const total = new Prisma.Decimal(price).times(count).toFixed(2);
            const balance = await this.balanceService.decrement(login, total, tx);
            await tx.historyBuy.create({
                data: {
                    login,
                    server_name: serverName,
                    item_id: itemId,
                    item_count: item.item_count,
                    count,
                    game_item_id: item.is_set ? item.game_id_set : String(item.game_id),
                    item_price: price,
                    item_total_price: total,
                    current_balance: new Prisma.Decimal(balance).plus(total).toFixed(2),
                    updated_balance: balance,
                },
            });
            await this.gameServerFactory.getService(serverName).insertItem(
                {
                    accountId,
                    gameItemId: item.game_id,
                    count: count * item.item_count,
                    gameItemSetId: item.game_id_set,
                    isSet: item.is_set,
                },
                tx,
            );
            return true;
        });
    }

    async getShopCategory(): Promise<ShopCategoryGetDTO> {
        const cacheKey = `${ShopService.cacheKeys}:category`;
        const cachedResult = await this.cacheService.getDataCache<ShopCategoryGetDTO>(cacheKey);
        if (cachedResult) {
            return cachedResult;
        }
        const result = await this.prisma.gameServer.findMany({
            where: {
                is_active: true,
                shop_category: {
                    some: {
                        is_active: true,
                    },
                },
            },
            select: {
                server_name: true,
                shop_category: {
                    select: {
                        category_id: true,
                    },
                },
            },
        });

        const categoryOrder = [
            ShopCategory.SALES,
            ShopCategory.CONSUMABLES,
            ShopCategory.SETS,
            ShopCategory.WINGS,
            ShopCategory.RAINCOATS,
            ShopCategory.COSTUMES,
            ShopCategory.HELMETS,
            ShopCategory.PETS,
            ShopCategory.STONES,
            ShopCategory.APPEALS,
            ShopCategory.OTHER,
        ];

        const transformedResult = result.reduce<Record<string, string[]>>(
            (acc, server) => {
                const sortedCategories = categoryOrder.filter((category) => server.shop_category.some((sc) => sc.category_id === category));
                acc[server.server_name] = sortedCategories;
                return acc;
            },
            {} as Record<string, string[]>,
        );

        await this.cacheService.setDataCache(transformedResult, cacheKey);
        return transformedResult;
    }

    async getShopItems({ categoryId, page, serverName }: ShopItemsGetDTO): Promise<ShopItemsDTO> {
        const cacheKey = `${ShopService.cacheKeys}:${serverName}:${categoryId}:${page}`;
        const cachedData = await this.cacheService.getDataCache<ShopItemsDTO>(cacheKey);
        if (cachedData) {
            return cachedData;
        }
        const LIMIT = 12;
        const SKIP = (page - 1) * LIMIT;

        const whereCondition = {
            server_name: serverName,
            is_active: true,
            shop_category: {
                is_active: true,
            },
            game_server: {
                is_active: true,
            },
        };

        if (categoryId === 'sales') {
            whereCondition['sale'] = { not: '' };
        } else {
            whereCondition['category_id'] = categoryId;
        }

        const [items, totalCount] = await Promise.all([
            this.prisma.shopItem.findMany({
                where: whereCondition,
                skip: SKIP,
                take: LIMIT,
                orderBy: {
                    price: 'desc',
                },
                select: {
                    item_id: true,
                    icon: true,
                    image: true,
                    info: true,
                    level: true,
                    category_id: true,
                    price: true,
                    sale: true,
                    item_count: true,
                    is_stack: true,
                    life_time: true,
                    life_type: true,
                    is_move: true,
                },
            }),
            this.prisma.shopItem.count({
                where: whereCondition,
            }),
        ]);

        const totalPages = totalCount > 0 ? Math.ceil(totalCount / LIMIT) : 1;
        const data = items.map((item) => ({
            itemId: item.item_id,
            icon: item.icon,
            image: item.image,
            info: item.info,
            level: item.level,
            categoryId: item.category_id,
            price: item.price,
            sale: item.sale,
            itemCount: item.item_count,
            isStack: item.is_stack,
            lifeTime: item.life_time,
            lifeType: ShopItemLifeType[item.life_type],
            isMove: item.is_move,
        }));

        await this.cacheService.setDataCache({ data, totalPages, currentPage: page }, cacheKey);

        return {
            data,
            totalPages,
            currentPage: page,
        };
    }
}
