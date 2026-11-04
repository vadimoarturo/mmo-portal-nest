import {
  ShopCategoryGetDTO,
  ShopItemsDTO,
  ShopItemsGetDTO,
  ShopBuyDTO,
} from "@/types/dto/shop";
import { requestService } from "./request.service";
import { AuthSignInDTO } from "@/types/dto/auth/auth-signin.dto";
import { AuthSignUpDTO } from "@/types/dto/auth/auth-signup.dto";
import { AuthJwtAccessDTO } from "@/types/dto/auth/auth-jwt-access.dto";

import {
  TopGuildsDTO,
  TopPksDTO,
  TopPlayersDTO,
} from "@/types/dto/stats/stats.dto";
import { PayListDTO } from "@/types/dto/pay/pay-list.dto";
import {
  PayCreateRequestDTO,
  PayCreateResponseDTO,
} from "@/types/dto/pay/pay-create.dto";
import {
  AuctionBuyLotDTO,
  AuctionCancelLotDTO,
  AuctionLotsDTO,
  AuctionLotsGetDTO,
} from "@/types/dto/auction";
import { AuctionCreateLotDTO } from "@/types/dto/auction";
import {
  AuthChangePasswordDTO,
  AuthChangePasswordVerifyDTO,
} from "@/types/dto/auth";
import { AuthVerifyEmailDTO } from "@/types/dto/auth/auth-verify-email.dto";

export const BackendApiService = {
  async logout() {
    return await requestService<null, boolean>({
      path: "/auth/logout",
      method: "POST",
    });
  },

  async signIn(data: AuthSignInDTO) {
    return await requestService<AuthSignInDTO, AuthJwtAccessDTO>({
      path: "/auth/signin",
      method: "POST",
      data: data,
    });
  },

  async signUp(data: AuthSignUpDTO) {
    return await requestService<AuthSignUpDTO, AuthJwtAccessDTO>({
      path: "/auth/signup",
      method: "POST",
      data: data,
    });
  },

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

  async payCreate(data: PayCreateRequestDTO): Promise<PayCreateResponseDTO> {
    return await requestService<PayCreateRequestDTO, PayCreateResponseDTO>({
      path: "/pay/create",
      method: "POST",
      data: data,
    });
  },

  async getBalance(): Promise<string> {
    return await requestService<null, string>({
      path: "/user/balance",
      method: "GET",
    });
  },

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

  async getPaymentMethods(): Promise<PayListDTO[]> {
    return await requestService<null, PayListDTO[]>({
      path: "/pay/list",
      method: "GET",
    });
  },

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

  async changePassword(data: AuthChangePasswordDTO): Promise<boolean> {
    return await requestService<AuthChangePasswordDTO, boolean>({
      path: "/auth/password/resend",
      method: "POST",
      data: data,
    });
  },

  async verifyChangePassword(
    data: AuthChangePasswordVerifyDTO,
  ): Promise<AuthJwtAccessDTO> {
    return await requestService<AuthChangePasswordVerifyDTO, AuthJwtAccessDTO>({
      path: "/auth/verify/password",
      method: "POST",
      data: data,
    });
  },

  async resendVerifyEmail(): Promise<boolean> {
    return await requestService<null, boolean>({
      path: "/auth/verify/email/resend",
      method: "GET",
    });
  },

  async verifyEmail(data: AuthVerifyEmailDTO): Promise<AuthJwtAccessDTO> {
    return await requestService<AuthVerifyEmailDTO, AuthJwtAccessDTO>({
      path: "/auth/verify/email",
      method: "POST",
      data: data,
    });
  },
};
