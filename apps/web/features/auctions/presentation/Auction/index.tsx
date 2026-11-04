"use client";
import { walletApi } from "@/features/wallet/infrastructure/api";
import { auctionsApi } from "@/features/auctions/infrastructure/api";


import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/UI/Button";
import { useModal } from "@/core/providers/modal.provider";
import { useAuth } from "@/core/providers/auth.provider";
import { AuctionLotsDTO, AuctionLotDTO } from "@/features/auctions/contracts";
import { Auth } from "@/features/identity/presentation/Auth";
import Skeleton from "@/components/UI/Skeleton";
import { CreateLotModal } from "@/features/auctions/presentation/Auction/CreateLotModal";
import { MyLotsModal } from "@/features/auctions/presentation/Auction/MyLotsModal";
import { BuyLotModal } from "@/features/auctions/presentation/Auction/BuyLotModal";
import Image from "next/image";

import { GameServerName } from "@/types/enum/game-server-name.enum";

export const Auction = () => {
  const { t } = useTranslation();
  const { showModal } = useModal();
  const { isAuth } = useAuth();

  const [page, setPage] = useState<number>(1);
  const [balance, setBalance] = useState<string>("0");

  // Получаем баланс для авторизованных пользователей
  const { data: balanceData, refetch: refetchUserBalance } = useQuery({
    queryKey: ["getBalance"],
    queryFn: () => walletApi.getBalance(),
    refetchOnWindowFocus: false,
    enabled: isAuth,
  });

  const refetchBalance = () => {
    refetchUserBalance();
  };

  useEffect(() => {
    if (balanceData) {
      setBalance(balanceData);
    }
  }, [balanceData]);

  // Получаем все лоты
  const {
    data: lotsData,
    isLoading: lotsLoading,
    refetch: refetchLots,
  } = useQuery<AuctionLotsDTO>({
    queryKey: ["auction-lots", page],
    queryFn: () =>
      auctionsApi.getAuctionLots({
        page,
        serverName: GameServerName.MMO,
      }),
    refetchOnWindowFocus: false,
    placeholderData: (previousData) =>
      previousData as AuctionLotsDTO | undefined,
  });

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (lotsData && lotsData.totalPages && page < lotsData.totalPages)
      setPage(page + 1);
  };

  const handleBuyLot = (lot: AuctionLotDTO) => {
    if (!isAuth) {
      showModal(<Auth typeInitial="SIGN_IN" />);
      return;
    }
    showModal(
      <BuyLotModal
        lot={lot}
        onSuccess={() => {
          refetchLots();
          refetchBalance();
        }}
      />,
    );
  };

  const handleCreateLot = () => {
    if (!isAuth) {
      showModal(<Auth typeInitial="SIGN_IN" />);
      return;
    }
    showModal(<CreateLotModal onSuccess={() => refetchLots()} />);
  };

  const handleMyLots = () => {
    if (!isAuth) {
      showModal(<Auth typeInitial="SIGN_IN" />);
      return;
    }
    showModal(<MyLotsModal onSuccess={() => refetchLots()} />);
  };

  return (
    <div className="flex items-start justify-center min-h-screen w-full p-5">
      <div className="bg-gradient-to-br from-black-80 to-black-2 w-full rounded-xl p-4 flex flex-col backdrop-blur border border-gray-35 shadow-lg shadow-black/30">
        {/* Заголовок и баланс */}
        <div className="pb-3 mb-4 border-b border-gray-35">
          {/* Заголовок - центрированный на десктопе */}
          <div className="flex items-center justify-center mb-3 not-mb:mb-4">
            <h1 className="text-white-1 text-xl not-mb:text-2xl font-semibold tracking-wide">
              {t("auction:title")}
            </h1>
          </div>

          {/* Баланс и кнопки - центрированные на десктопе */}
          {isAuth && (
            <div className="flex flex-col gap-3">
              {/* Десктопная версия - все по центру */}
              <div className="hidden not-mb:flex items-center justify-center gap-4">
                {/* Баланс */}
                <div className="bg-gradient-to-br from-black-80 to-black-2 rounded-lg p-2 backdrop-blur border border-gray-35">
                  <span className="text-white/70 text-xs mr-2">
                    {t("auction:balance")}:
                  </span>
                  <span className="text-green font-bold text-sm">
                    {balance} Credits
                  </span>
                </div>

                {/* Кнопки */}
                <div className="flex gap-2">
                  <Button
                    theme="green"
                    onClick={handleMyLots}
                    className="px-3 py-1.5 text-xs whitespace-nowrap"
                  >
                    {t("auction:myLots")}
                  </Button>
                  <Button
                    theme="white"
                    onClick={handleCreateLot}
                    className="px-3 py-1.5 text-xs whitespace-nowrap"
                  >
                    {t("auction:createLot")}
                  </Button>
                </div>
              </div>

              {/* Мобильная версия */}
              <div className="not-mb:hidden">
                {/* Баланс */}
                <div className="bg-gradient-to-br from-black-80 to-black-2 rounded-lg p-2 backdrop-blur border border-gray-35 w-fit mb-3">
                  <span className="text-white/70 text-xs mr-2">
                    {t("auction:balance")}:
                  </span>
                  <span className="text-green font-bold text-sm">
                    {balance} Credits
                  </span>
                </div>

                {/* Кнопки */}
                <div className="flex gap-2">
                  <Button
                    theme="green"
                    onClick={handleMyLots}
                    className="flex-1 px-3 py-2 text-xs"
                  >
                    {t("auction:myLots")}
                  </Button>
                  <Button
                    theme="white"
                    onClick={handleCreateLot}
                    className="flex-1 px-3 py-2 text-xs"
                  >
                    {t("auction:createLot")}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Таблица лотов */}
        <div className="bg-black-25 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black-35">
                <tr>
                  <th className="text-left p-3 text-white-1 font-semibold">
                    {t("auction:table.character")}
                  </th>
                  <th className="text-left p-3 text-white-1 font-semibold">
                    {t("auction:table.gold")}
                  </th>
                  <th className="text-left p-3 text-white-1 font-semibold">
                    {t("auction:table.price")}
                  </th>
                  <th className="text-left p-3 text-white-1 font-semibold">
                    {t("auction:table.rate")}
                  </th>
                  <th className="text-center p-3 text-white-1 font-semibold">
                    {t("auction:table.action")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {lotsLoading ? (
                  Array.from({ length: 10 }).map((_, idx) => (
                    <tr key={idx} className="border-b border-gray-35">
                      <td className="p-3">
                        <Skeleton style="rounded" className="w-24 h-4" />
                      </td>
                      <td className="p-3">
                        <Skeleton style="rounded" className="w-20 h-4" />
                      </td>
                      <td className="p-3">
                        <Skeleton style="rounded" className="w-16 h-4" />
                      </td>
                      <td className="p-3">
                        <Skeleton style="rounded" className="w-12 h-4" />
                      </td>
                      <td className="p-3 text-center">
                        <Skeleton
                          style="rounded"
                          className="w-16 h-8 mx-auto"
                        />
                      </td>
                    </tr>
                  ))
                ) : lotsData && lotsData.data && lotsData.data.length ? (
                  lotsData.data.map((lot: AuctionLotDTO) => {
                    const rate = (
                      Number(lot.gold) / Number(lot.credits)
                    ).toFixed(0);
                    return (
                      <tr
                        key={lot.id}
                        className="border-b border-gray-35 hover:bg-black-35/50 transition-colors"
                      >
                        <td className="p-3 text-white-1 font-medium">
                          {lot.name}
                        </td>
                        <td className="p-3 text-yellow-300 font-mono flex items-center gap-2">
                          <Image
                            src="/images/portal-mark.svg"
                            alt="Gold"
                            width={16}
                            height={16}
                            className="inline-block"
                          />
                          {Number(lot.gold).toLocaleString()}
                        </td>
                        <td className="p-3 text-green font-mono">
                          {lot.credits} Credits
                        </td>
                        <td className="p-3 text-white/70 font-mono">
                          {rate}:1
                        </td>
                        <td className="p-3 text-center">
                          <Button
                            theme="green"
                            onClick={() => handleBuyLot(lot)}
                            className="px-3 py-1 text-xs"
                          >
                            {t("auction:buy")}
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-white/70">
                      {t("auction:noLots")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Пагинация */}
        {lotsData && lotsData.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={handlePrevPage}
              disabled={page === 1}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-black-35 hover:bg-black-25 text-white-1 disabled:opacity-50 border border-black-35 transition text-sm"
            >
              {t("button:pagination.prev")}
            </button>
            <span className="text-white/90 text-sm">
              {page} / {lotsData.totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={page === lotsData.totalPages}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-black-35 hover:bg-black-25 text-white-1 disabled:opacity-50 border border-black-35 transition text-sm"
            >
              {t("button:pagination.next")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
