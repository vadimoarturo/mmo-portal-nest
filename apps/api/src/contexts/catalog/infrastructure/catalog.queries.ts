import { Injectable } from '@nestjs/common';
import { PrismaService } from '#Root/platform/prisma/prisma.service';
import { CacheService } from '#Root/platform/cache/cache.service';
import { ShopCategory, ShopItemLifeType } from '#Root/shared/domain/enum/index';
import { ShopCategoryGetDTO } from '../application/contracts/shop-category.dto';
import { ShopItemsDTO, ShopItemsGetDTO } from '../application/contracts/shop-items.dto';
@Injectable()
export class CatalogQueries {
    static readonly cacheKeys = 'shop';
    constructor(
        private readonly prisma: PrismaService,
        private readonly cacheService: CacheService,
    ) {}
    async onModuleInit() {
        await this.cacheService.deleteDataCache(CatalogQueries.cacheKeys);
    }
    async onModuleDestroy() {
        await this.cacheService.deleteDataCache(CatalogQueries.cacheKeys);
    }

    async getShopCategory(): Promise<ShopCategoryGetDTO> {
        const cacheKey = `${CatalogQueries.cacheKeys}:category`;
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
        const cacheKey = `${CatalogQueries.cacheKeys}:${serverName}:${categoryId}:${page}`;
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
