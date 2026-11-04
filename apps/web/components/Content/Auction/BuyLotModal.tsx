"use client";

import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/UI/Button";
import { useModal } from "@/core/providers/modal.provider";
import { useNotification } from "@/core/providers/notify.provider";
import { BackendApiService } from "@/core/services/api";
import { AuctionLotDTO, AuctionBuyLotDTO } from "@/types/dto/auction";
import { ApiError } from "@/types/errors";
import { returnCodeError } from "@/core/helpers/returnCodeError";

interface BuyLotModalProps {
  lot: AuctionLotDTO;
  onSuccess: () => void;
}

export const BuyLotModal = ({ lot, onSuccess }: BuyLotModalProps) => {
  const { t } = useTranslation();
  const { hideModal } = useModal();
  const { showNotification } = useNotification();

  const { mutate: buyLot, isPending } = useMutation({
    mutationKey: ["buyAuctionLot"],
    mutationFn: (data: AuctionBuyLotDTO) =>
      BackendApiService.buyAuctionLot(data),
    onSuccess: () => {
      showNotification(t("auction:buySuccess"), "success");
      hideModal();
      onSuccess();
    },
    onError: (error: ApiError) => {
      const codeError = returnCodeError(error);
      showNotification(t("auction:buyError"), "error", codeError);
    },
  });

  const handleBuyLot = () => {
    buyLot({ id: lot.id });
  };

  const rate = (Number(lot.gold) / Number(lot.credits)).toFixed(0);

  return (
    <div className="flex flex-col gap-5 w-full max-w-md p-6">
      <div className="text-center">
        <h2 className="text-white-1 text-xl font-semibold mb-2">
          {t("auction:buyLot")}
        </h2>
        <p className="text-white/70 text-sm">{t("auction:buyDescription")}</p>
      </div>

      {/* Информация о лоте */}
      <div className="bg-black-25 rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-white/70 text-sm">
            {t("auction:table.character")}:
          </span>
          <span className="text-white-1 font-medium">{lot.name}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-white/70 text-sm">
            {t("auction:table.gold")}:
          </span>
          <span className="text-green font-mono font-medium">
            {Number(lot.gold).toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-white/70 text-sm">
            {t("auction:table.price")}:
          </span>
          <span className="text-yellow-300 font-mono font-medium">
            {lot.credits} Credits
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-white/70 text-sm">
            {t("auction:table.rate")}:
          </span>
          <span className="text-white-1 font-mono font-medium">{rate}:1</span>
        </div>
      </div>

      {/* Предупреждение */}
      <div className="bg-yellow-300/10 border border-yellow-300/30 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <span className="text-yellow-300 text-lg">⚠️</span>
          <div className="text-yellow-300/90 text-sm">
            <p className="font-medium mb-1">{t("auction:buyWarning.title")}</p>
            <p>{t("auction:buyWarning.description")}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          theme="green"
          onClick={handleBuyLot}
          className="flex-1"
          isDisabled={isPending}
          showLoader={isPending}
        >
          {t("auction:buy")}
        </Button>
      </div>
    </div>
  );
};
