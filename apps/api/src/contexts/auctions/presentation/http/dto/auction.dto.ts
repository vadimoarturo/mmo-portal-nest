import { GameServerName } from '#Root/shared/domain/enum/index';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, Min, IsNumberString, IsString, ValidateNested } from 'class-validator';

export class AuctionCreateLotDTO {
    @IsNumberString()
    readonly gold: string;

    @IsNumberString()
    readonly credits: string;

    @IsEnum(GameServerName)
    readonly serverName: GameServerName;
}

export class AuctionBuyLotDTO {
    @IsInt()
    @Min(1)
    readonly id: number;
}

export class AuctionLotDTO {
    @IsInt()
    @Min(1)
    readonly id: number;

    @IsString()
    readonly name: string;

    @IsNumberString()
    readonly gold: string;

    @IsNumberString()
    readonly credits: string;
}

export class AuctionLotsDTO {
    @Type(() => AuctionLotDTO)
    @ValidateNested({ each: true })
    @IsArray()
    readonly data: AuctionLotDTO[];

    @IsInt()
    readonly totalPages: number;

    @IsInt()
    readonly currentPage: number;
}

export class AuctionLotsGetDTO {
    @IsInt()
    @Min(1)
    readonly page: number;

    @IsEnum(GameServerName)
    readonly serverName: GameServerName;
}

export class AuctionCancelLotDTO {
    @IsInt()
    @Min(1)
    readonly id: number;
}
