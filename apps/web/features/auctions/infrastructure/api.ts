import { requestService } from "@/core/services/api/request.service";
import { AuctionBuyLotDTO, AuctionCancelLotDTO, AuctionLotsDTO, AuctionLotsGetDTO } from "@/features/auctions/contracts";
import { AuctionCreateLotDTO } from "@/features/auctions/contracts";

export const auctionsApi = {
async createAuctionLot(data: AuctionCreateLotDTO): Promise<boolean> {
    return await requestService<AuctionCreateLotDTO, boolean>({
      path: "/auction/create",
      method: "POST",
      data: data,
    });
  },

async buyAuctionLot(data: AuctionBuyLotDTO): Promise<boolean> {
    return await requestService<AuctionBuyLotDTO, boolean>({
      path: "/auction/buy",
      method: "POST",
      data: data,
    });
  },

async getAuctionLots(data: AuctionLotsGetDTO): Promise<AuctionLotsDTO> {
    return await requestService<AuctionLotsGetDTO, AuctionLotsDTO>({
      path: "/auction/lots",
      method: "POST",
      data: data,
    });
  },

async getMyAuctionLots(data: AuctionLotsGetDTO): Promise<AuctionLotsDTO> {
    return await requestService<AuctionLotsGetDTO, AuctionLotsDTO>({
      path: "/auction/lots/my",
      method: "POST",
      data: data,
    });
  },

async cancelAuctionLot(data: AuctionCancelLotDTO): Promise<boolean> {
    return await requestService<AuctionCancelLotDTO, boolean>({
      path: "/auction/cancel",
      method: "POST",
      data: data,
    });
  },
};
