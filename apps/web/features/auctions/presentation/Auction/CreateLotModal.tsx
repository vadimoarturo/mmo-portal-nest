"use client";
import { auctionsApi } from "@/features/auctions/infrastructure/api";


import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/UI/Button";
import { useModal } from "@/core/providers/modal.provider";
import { useNotification } from "@/core/providers/notify.provider";
import { AuctionCreateLotDTO } from "@/features/auctions/contracts";
import { ApiError } from "@/types/errors";
import { returnCodeError } from "@/core/helpers/returnCodeError";

import { GameServerName } from "@/types/enum/game-server-name.enum";

interface CreateLotModalProps {
  onSuccess: () => void;
}

export const CreateLotModal = ({ onSuccess }: CreateLotModalProps) => {
  const { t } = useTranslation();
  const { hideModal } = useModal();
  const { showNotification } = useNotification();

  const [goldAmount, setGoldAmount] = useState("");
  const [creditAmount, setCreditAmount] = useState("");

  const numericGoldAmount = parseFloat(goldAmount.replace(/\./g, "")) || 0;
  const numericCreditAmount = parseFloat(creditAmount.replace(/\./g, "")) || 0;

  // Форматирование чисел с точками для разделения тысяч
  const formatNumber = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const { mutate: createLot, isPending } = useMutation({
    mutationKey: ["createAuctionLot"],
    mutationFn: (data: AuctionCreateLotDTO) =>
      auctionsApi.createAuctionLot(data),
    onSuccess: () => {
      showNotification(t("auction:createSuccess"), "success");
      hideModal();
      onSuccess();
    },
    onError: (error: ApiError) => {
      const codeError = returnCodeError(error);
      showNotification(t("auction:createError"), "error", codeError);
    },
  });

  const handleSubmit = () => {
    if (!numericGoldAmount || !numericCreditAmount) {
      showNotification(t("auction:fillAllFields"), "error");
      return;
    }

    if (numericGoldAmount < 1000000 || numericGoldAmount > 9000000000) {
      showNotification(t("auction:goldRange"), "error");
      return;
    }

    if (numericCreditAmount < 1 || numericCreditAmount > 9000000000) {
      showNotification(t("auction:creditRange"), "error");
      return;
    }

    createLot({
      gold: numericGoldAmount.toString(),
      credits: numericCreditAmount.toString(),
      serverName: GameServerName.MMO,
    });
  };

  const isDisabled =
    !numericGoldAmount ||
    !numericCreditAmount ||
    isPending ||
    numericGoldAmount < 1000000 ||
    numericGoldAmount > 9000000000 ||
    numericCreditAmount < 1 ||
    numericCreditAmount > 9000000000;

  return (
    <div className="flex flex-col gap-5 w-full max-w-md p-6">
      <div className="text-center">
        <h2 className="text-white-1 text-xl font-semibold mb-2">
          {t("auction:createLot")}
        </h2>
        <p className="text-white/70 text-sm">
          {t("auction:createDescription")}
        </p>
      </div>

      <div className="space-y-4">
        {/* Ввод количества золота */}
        <div className="w-full">
          <div className="text-white/90 text-sm mb-2">
            {t("auction:form.gold")}
            <span className="text-white/60 text-xs ml-2">
              ({t("auction:form.limits.gold")}: 1.000.000 - 9.000.000.000)
            </span>
          </div>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9.]*"
            value={goldAmount}
            onChange={(e) => {
              const val = e.target.value;
              if (/^[0-9.]*$/.test(val)) {
                const formatted = formatNumber(val);
                setGoldAmount(formatted);
              }
            }}
            onBlur={(e) => {
              const value = e.currentTarget.value;
              const numValue = parseFloat(value.replace(/\./g, ""));

              if (!value || numValue < 0) {
                setGoldAmount("");
              } else if (numValue > 0 && numValue < 1000000) {
                setGoldAmount("1.000.000");
              }
            }}
            placeholder={t("auction:form.goldPlaceholder")}
            className={`w-full text-center border rounded-md py-3 px-4 text-lg ${
              numericGoldAmount > 0 &&
              (numericGoldAmount < 1000000 || numericGoldAmount > 9000000000)
                ? "bg-red-900/20 border-red-500 text-white"
                : "bg-black-25 border-black-35 text-white"
            }`}
          />
          {numericGoldAmount > 0 &&
            (numericGoldAmount < 1000000 || numericGoldAmount > 9000000000) && (
              <div className="text-red-400 text-xs mt-1">
                {t("auction:form.limits.goldRange")}
              </div>
            )}
        </div>

        {/* Ввод цены в Credits */}
        <div className="w-full">
          <div className="text-white/90 text-sm mb-2">
            {t("auction:form.price")}
            <span className="text-white/60 text-xs ml-2">
              ({t("auction:form.limits.price")}: 1 - 9.000.000.000 Credits)
            </span>
          </div>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9.]*"
            value={creditAmount}
            onChange={(e) => {
              const val = e.target.value;
              if (/^[0-9.]*$/.test(val)) {
                const formatted = formatNumber(val);
                setCreditAmount(formatted);
              }
            }}
            onBlur={(e) => {
              const value = e.currentTarget.value;
              const numValue = parseFloat(value.replace(/\./g, ""));

              if (!value || numValue < 0) {
                setCreditAmount("");
              } else if (numValue > 0 && numValue < 1) {
                setCreditAmount("1");
                showNotification(t("auction:form.limits.priceMin"), "error");
              }
            }}
            placeholder={t("auction:form.pricePlaceholder")}
            className={`w-full text-center border rounded-md py-3 px-4 text-lg ${
              numericCreditAmount > 0 &&
              (numericCreditAmount < 1 || numericCreditAmount > 9000000000)
                ? "bg-red-900/20 border-red-500 text-white"
                : "bg-black-25 border-black-35 text-white"
            }`}
          />
          {numericCreditAmount > 0 &&
            (numericCreditAmount < 1 || numericCreditAmount > 9000000000) && (
              <div className="text-red-400 text-xs mt-1">
                {t("auction:form.limits.priceRange")}
              </div>
            )}
        </div>
      </div>

      {/* Предупреждение */}
      <div className="bg-yellow-300/10 border border-yellow-300/30 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <span className="text-yellow-300 text-lg">⚠️</span>
          <div className="text-yellow-300/90 text-sm">
            <p className="font-medium mb-1">
              {t("auction:createWarning.title")}
            </p>
            <p>{t("auction:createWarning.description")}</p>
          </div>
        </div>
      </div>

      {/* Отображение курса */}
      {numericGoldAmount > 0 && numericCreditAmount > 0 && (
        <div className="bg-green/10 border border-green/30 rounded-lg p-3 text-center">
          <p className="text-white/70 text-sm mb-1">
            {t("auction:form.rate")}:
          </p>
          <p className="text-green font-mono text-lg">
            {(numericGoldAmount / numericCreditAmount).toFixed(0)}:1
          </p>
          <p className="text-white/50 text-xs mt-1">
            1 Credits ={" "}
            {(numericGoldAmount / numericCreditAmount).toLocaleString()}{" "}
            {t("auction:form.goldShort")}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          theme="green"
          onClick={handleSubmit}
          className="flex-1"
          isDisabled={isDisabled}
          showLoader={isPending}
        >
          {t("auction:create")}
        </Button>
      </div>
    </div>
  );
};
