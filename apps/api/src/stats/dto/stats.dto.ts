import { IsNumber, IsString } from 'class-validator';

export class TopPlayersDTO {
    @IsString()
    name: string;
    @IsNumber()
    job: number;
    @IsNumber()
    lv: number;
    @IsNumber()
    race: number;
    @IsString()
    guildName: string;
    @IsString()
    guildIcon: string;
}

export class TopPksDTO extends TopPlayersDTO {
    @IsNumber()
    pkc: number;
}

export class TopGuildsDTO {
    @IsString()
    name: string;
    @IsString()
    icon: string;
    @IsNumber()
    dungeons: number;
    @IsNumber()
    players: number;
    @IsNumber()
    leaders: number;
}
