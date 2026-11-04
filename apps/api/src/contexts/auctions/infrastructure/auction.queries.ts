import { Injectable } from '@nestjs/common';
import { PrismaService } from '#Root/platform/prisma/prisma.service';
import { AuctionLotsGetDTO, AuctionLotsDTO } from '../application/contracts/auction.dto';
@Injectable()
export class AuctionQueries {
    constructor(private readonly prisma: PrismaService) {}
    async getLots({ page, serverName }: AuctionLotsGetDTO): Promise<AuctionLotsDTO> {
        const LIMIT = 10;
        const SKIP = (page - 1) * LIMIT;

        const [lots, totalCount] = await Promise.all([
            this.prisma.orderAuction.findMany({
                where: { status: 'active', server_name: serverName },
                select: {
                    id: true,
                    name: true,
                    gold: true,
                    credits: true,
                },
                skip: SKIP,
                take: LIMIT,
                orderBy: { id: 'desc' },
            }),
            this.prisma.orderAuction.count({
                where: { status: 'active', server_name: serverName },
            }),
        ]);

        const totalPages = totalCount > 0 ? Math.ceil(totalCount / LIMIT) : 1;

        return {
            data: lots.map((lot) => ({
                id: lot.id,
                name: lot.name,
                gold: String(lot.gold),
                credits: String(lot.credits),
            })),
            totalPages,
            currentPage: page,
        };
    }

    async getMyLots({ page, serverName }: AuctionLotsGetDTO, login: string): Promise<AuctionLotsDTO> {
        const LIMIT = 5;
        const SKIP = (page - 1) * LIMIT;

        const [lots, totalCount] = await Promise.all([
            this.prisma.orderAuction.findMany({
                where: { login, status: 'active', server_name: serverName },
                select: {
                    id: true,
                    name: true,
                    gold: true,
                    credits: true,
                },
                skip: SKIP,
                take: LIMIT,
                orderBy: { id: 'desc' },
            }),
            this.prisma.orderAuction.count({
                where: { login, status: 'active', server_name: serverName },
            }),
        ]);

        const totalPages = totalCount > 0 ? Math.ceil(totalCount / LIMIT) : 1;

        return {
            data: lots.map((lot) => ({
                id: lot.id,
                name: lot.name,
                gold: String(lot.gold),
                credits: String(lot.credits),
            })),
            totalPages,
            currentPage: page,
        };
    }
}
