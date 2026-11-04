import { ShopCategoryGetDTO, ShopItemsDTO, ShopItemsGetDTO, ShopBuyDTO } from "@/features/catalog/contracts";
import { requestService } from "@/core/services/api/request.service";

export const catalogApi = {
async getShopCategory(): Promise<ShopCategoryGetDTO> {
    return await requestService<null, ShopCategoryGetDTO>({
      path: "/shop/category",
      method: "GET",
    });
  },

async getShopItems(data: ShopItemsGetDTO): Promise<ShopItemsDTO> {
    return await requestService<ShopItemsGetDTO, ShopItemsDTO>({
      path: "/shop/items",
      method: "POST",
      data: data,
    });
  },

async buyShopItem(data: ShopBuyDTO): Promise<boolean> {
    return await requestService<ShopBuyDTO, boolean>({
      path: "/shop/buy",
      method: "POST",
      data: data,
    });
  },
};
