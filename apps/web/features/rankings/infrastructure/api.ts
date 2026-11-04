import { requestService } from "@/core/services/api/request.service";
import { TopGuildsDTO, TopPksDTO, TopPlayersDTO } from "@/features/rankings/contracts/stats.dto";

export const rankingsApi = {
async getTopPlayers(): Promise<TopPlayersDTO[]> {
    return await requestService<null, TopPlayersDTO[]>({
      path: "/top/players",
      method: "GET",
    });
  },

async getTopPks(): Promise<TopPksDTO[]> {
    return await requestService<null, TopPksDTO[]>({
      path: "/top/pks",
      method: "GET",
    });
  },

async getTopGuilds(): Promise<TopGuildsDTO[]> {
    return await requestService<null, TopGuildsDTO[]>({
      path: "/top/guilds",
      method: "GET",
    });
  },
};
