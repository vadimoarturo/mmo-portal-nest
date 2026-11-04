"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/UI/Button";

import { useNotification } from "@/core/providers/notify.provider";
import { BackendApiService } from "@/core/services/api";
import {
  AuctionLotsDTO,
  AuctionLotDTO,
  AuctionCancelLotDTO,
} from "@/types/dto/auction";
import { ApiError } from "@/types/errors";
import { returnCodeError } from "@/core/helpers/returnCodeError";
import Skeleton from "@/components/UI/Skeleton";
import Image from "next/image";

import { GameServerName } from "@/types/enum/game-server-name.enum";

interface MyLotsModalProps {
  onSuccess: () => void;
}

export const MyLotsModal = ({ onSuccess }: MyLotsModalProps) => {
  const { t } = useTranslation();

  const { showNotification } = useNotification();

  const [page, setPage] = useState<number>(1);

  const {
    data: myLotsData,
    isLoading: myLotsLoading,
    refetch: refetchMyLots,
  } = useQuery<AuctionLotsDTO>({
    queryKey: ["my-auction-lots", page],
    queryFn: () =>
      BackendApiService.getMyAuctionLots({
        page,
        serverName: GameServerName.MMO,
      }),
    refetchOnWindowFocus: false,
  });

  const { mutate: cancelLot, isPending: cancelPending } = useMutation({
    mutationKey: ["cancelAuctionLot"],
    mutationFn: (data: AuctionCancelLotDTO) =>
      BackendApiService.cancelAuctionLot(data),
    onSuccess: () => {
      showNotification(t("auction:cancelSuccess"), "success");
      refetchMyLots();
      onSuccess();
    },
    onError: (error: ApiError) => {
      const codeError = returnCodeError(error);
      showNotification(t("auction:cancelError"), "error", codeError);
    },
  });

  const handleCancelLot = (lotId: number) => {
    if (window.confirm(t("auction:cancelConfirm"))) {
      cancelLot({ id: lotId });
    }
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (myLotsData && myLotsData.totalPages && page < myLotsData.totalPages) {
      setPage(page + 1);
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full max-w-4xl p-6">
      <div className="text-center">
        <h2 className="text-white-1 text-xl font-semibold mb-2">
          {t("auction:myLots")}
        </h2>
        <p className="text-white/70 text-sm">
          {t("auction:myLotsDescription")}
        </p>
      </div>

      {/* Таблица моих лотов */}
      <div className="bg-black-25 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black-35">
              <tr>
                <th className="text-left p-3 text-white-1 font-semibold text-sm">
                  {t("auction:table.character")}
                </th>
                <th className="text-left p-3 text-white-1 font-semibold text-sm">
                  {t("auction:table.gold")}
                </th>
                <th className="text-left p-3 text-white-1 font-semibold text-sm">
                  {t("auction:table.price")}
                </th>
                <th className="text-left p-3 text-white-1 font-semibold text-sm">
                  {t("auction:table.rate")}
                </th>
                <th className="text-center p-3 text-white-1 font-semibold text-sm">
                  {t("auction:table.action")}
                </th>
              </tr>
            </thead>
            <tbody>
              {myLotsLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
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
                      <Skeleton style="rounded" className="w-16 h-6 mx-auto" />
                    </td>
                  </tr>
                ))
              ) : myLotsData && myLotsData.data && myLotsData.data.length ? (
                myLotsData.data.map((lot: AuctionLotDTO) => {
                  const rate = (Number(lot.gold) / Number(lot.credits)).toFixed(
                    0,
                  );
                  return (
                    <tr
                      key={lot.id}
                      className="border-b border-gray-35 hover:bg-black-35/50 transition-colors"
                    >
                      <td className="p-3 text-white-1 font-medium text-sm">
                        {lot.name}
                      </td>
                      <td className="p-3 text-yellow-300 font-mono text-sm">
                        <Image
                          src="/images/portal-mark.svg"
                          alt="Gold"
                          width={16}
                          height={16}
                          className="inline-block"
                        />
                        {Number(lot.gold).toLocaleString()}
                      </td>
                      <td className="p-3 text-green font-mono text-sm">
                        {lot.credits} Credits
                      </td>
                      <td className="p-3 text-white/70 font-mono text-sm">
                        {rate}:1
                      </td>
                      <td className="p-3 text-center">
                        <Button
                          theme="white"
                          onClick={() => handleCancelLot(lot.id)}
                          className="px-3 py-1 text-xs"
                          isDisabled={cancelPending}
                        >
                          {t("auction:cancel")}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-white/70">
                    {t("auction:noMyLots")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Пагинация */}
      {myLotsData && myLotsData.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={handlePrevPage}
            disabled={page === 1}
            className="inline-flex items-center px-3 py-2 rounded-lg bg-black-35 hover:bg-black-25 text-white-1 disabled:opacity-50 border border-black-35 transition text-sm"
          >
            {t("button:pagination.prev")}
          </button>
          <span className="text-white/90 text-sm">
            {page} / {myLotsData.totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={page === myLotsData.totalPages}
            className="inline-flex items-center px-3 py-2 rounded-lg bg-black-35 hover:bg-black-25 text-white-1 disabled:opacity-50 border border-black-35 transition text-sm"
          >
            {t("button:pagination.next")}
          </button>
        </div>
      )}
    </div>
  );
};
