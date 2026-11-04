export interface InsertItemData {
    accountId: number;
    gameItemId?: number;
    gameItemSetId: string;
    isSet: boolean;
    count: number;
}

export interface TopPlayers {
    name: string;
    job: number;
    lv: number;
    race: number;
    guildName: string;
    guildIcon: string;
}

export interface TopPks extends TopPlayers {
    pkc: number;
}

export interface TopGuilds {
    name: string;
    icon: string;
    dungeons: number;
    players: number;
    leaders: string;
}
