import { GameServerName } from "../../enum";
import { ShopItemLifeType } from "../../enum/shop-item-life-type.enum";

export interface ShopItemsGetDTO {
  categoryId: string;
  page: number;
  serverName: GameServerName;
}

export interface ShopItemDTO {
  itemId: number;
  icon: string;
  image: string;
  info: ShopItemInfoDTO;
  level?: string;
  categoryId: string;
  price: string;
  sale: string;
  itemCount: number;
  isStack: boolean;
  lifeTime?: string;
  lifeType: ShopItemLifeType;
  isMove: boolean;
}

export interface ShopItemInfoDTO {
  title: string;
  text: string;
}

export interface ShopItemsDTO {
  data: ShopItemDTO[];
  totalPages: number;
  currentPage: number;
}
