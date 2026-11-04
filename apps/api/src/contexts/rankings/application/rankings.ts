export interface TopPlayer {
    name: string;
    job: number;
    lv: number;
    race: number;
    guildName: string;
    guildIcon: string;
}
export interface TopPk extends TopPlayer {
    pkc: number;
}
export interface TopGuild {
    name: string;
    icon: string;
    dungeons: number;
    players: number;
    leaders: string;
}
export interface RankingsReadPort {
    getTopPlayers(): Promise<TopPlayer[]>;
    getTopPk(): Promise<TopPk[]>;
    getTopGuilds(): Promise<TopGuild[]>;
}
export class Rankings {
    constructor(private readonly projection: RankingsReadPort) {}
    getTopPlayers() {
        return this.projection.getTopPlayers();
    }
    getTopPk() {
        return this.projection.getTopPk();
    }
    getTopGuilds() {
        return this.projection.getTopGuilds();
    }
}
