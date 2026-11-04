export interface TopPlayersDTO {
  name: string;
  job: number;
  lv: number;
  race: number;
  guildName: string;
  guildIcon: string;
}

export interface TopPksDTO extends TopPlayersDTO {
  pkc: number;
}

export interface TopGuildsDTO {
  name: string;
  icon: string;
  dungeons: number;
  players: number;
  leaders: string;
}
