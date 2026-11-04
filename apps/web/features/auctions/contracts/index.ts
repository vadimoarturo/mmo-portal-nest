export interface AuctionCreateLotDTO {
  readonly gold: string;
  readonly credits: string;
  readonly serverName: string;
}

export interface AuctionBuyLotDTO {
  readonly id: number;
}

export interface AuctionLotDTO {
  readonly id: number;
  readonly name: string;
  readonly gold: string;
  readonly credits: string;
}

export interface AuctionLotsDTO {
  readonly data: AuctionLotDTO[];
  readonly totalPages: number;
  readonly currentPage: number;
}

export interface AuctionLotsGetDTO {
  readonly page: number;
  readonly serverName: string;
}

export interface AuctionCancelLotDTO {
  readonly id: number;
}
