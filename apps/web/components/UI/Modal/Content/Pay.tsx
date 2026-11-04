"use client";
import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/UI/Button";
import { appLink } from "@/components/Content/Header/constants";
import { useTranslation } from "react-i18next";
import { useNotification } from "@/core/providers/notify.provider";
import { useAuth } from "@/core/providers/auth.provider";
import { Auth } from "./Auth";
import { useModal } from "@/core/providers/modal.provider";
import { useMutation, useQuery } from "@tanstack/react-query";
import { BackendApiService } from "@/core/services/api";
import { PayProviders } from "@/types/enum/pay-providers.enum";
import Image from "next/image";
import {
  PayCreateRequestDTO,
  PayCreateResponseDTO,
} from "@/types/dto/pay/pay-create.dto";
import { ApiError } from "@/types/errors";
import { returnCodeError } from "@/core/helpers/returnCodeError";

const Pay = () => {
  const { t, i18n } = useTranslation();
  const { isAuth } = useAuth();
  const [creditAmount, setCreditAmount] = useState("");
  const { showModal } = useModal();
  const [selectedProvider, setSelectedProvider] = useState<PayProviders | null>(
    null,
  );
  const [agreeToTerms, setAgreeToTerms] = useState(true);
  const [isCryptoSelected, setIsCryptoSelected] = useState(false);
  const { showNotification } = useNotification();

  const { data: paymentMethodsData, isPending: isLoading } = useQuery({
    queryKey: ["getPaymentMethods"],
    queryFn: () => BackendApiService.getPaymentMethods(),
    refetchOnWindowFocus: false,
    enabled: isAuth,
  });

  // Устанавливаем первый провайдер по умолчанию
  useEffect(() => {
    if (
      paymentMethodsData &&
      paymentMethodsData.length > 0 &&
      !selectedProvider &&
      !isCryptoSelected
    ) {
      setSelectedProvider(paymentMethodsData[0].provider);
    }
  }, [paymentMethodsData, selectedProvider, isCryptoSelected]);

  const currentProvider = useMemo(() => {
    return paymentMethodsData?.find(
      (provider) => provider.provider === selectedProvider,
    );
  }, [paymentMethodsData, selectedProvider]);

  const numericCreditAmount = parseFloat(creditAmount) || 0;

  const paymentAmount = useMemo(() => {
    if (numericCreditAmount <= 0 || !currentProvider) return 0;
    return numericCreditAmount / parseFloat(currentProvider.rate);
  }, [numericCreditAmount, currentProvider]);

  // Расчет бонуса
  const bonusInfo = useMemo(() => {
    if (!currentProvider || numericCreditAmount <= 0) return null;

    // Находим подходящий бонус (берем максимальный, который подходит по сумме)
    const applicableBonus = currentProvider.bonus
      .filter((bonus) => numericCreditAmount >= parseFloat(bonus.amount))
      .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))[0];

    if (applicableBonus) {
      const bonusPercent = parseFloat(applicableBonus.percent);
      const bonusAmount = (numericCreditAmount * bonusPercent) / 100;
      const totalAmount = numericCreditAmount + bonusAmount;

      return {
        percent: bonusPercent,
        bonusAmount,
        totalAmount,
      };
    }

    return null;
  }, [currentProvider, numericCreditAmount]);

  const { mutate: payCreateApi } = useMutation({
    mutationKey: ["payCreate"],
    mutationFn: (data: PayCreateRequestDTO) =>
      BackendApiService.payCreate(data),
    onSuccess: (data: PayCreateResponseDTO) => {
      if (data.type === "redirect") {
        window.open(data.url as string, "_blank");
      } else {
        showNotification(t("pay:success"), "success");
      }
    },
    onError: (error: ApiError) => {
      const codeError = returnCodeError(error);
      showNotification(t("pay:error"), "error", codeError);
    },
  });

  const handleDonate = () => {
    if (isCryptoSelected) {
      // Для крипто метода открываем Discord
      if (appLink.discord)
        window.open(appLink.discord, "_blank", "noopener,noreferrer");
      return;
    }

    if (numericCreditAmount > 0 && currentProvider) {
      const minAmount = parseFloat(currentProvider.min);
      if (numericCreditAmount < minAmount) {
        showNotification(
          `${t("pay:minAmount")}: ${minAmount} Credits`,
          "error",
        );
        return;
      }
      payCreateApi({
        amount: numericCreditAmount.toString(),
        provider: selectedProvider as PayProviders,
        lang: i18n.language === "ru" ? "ru" : "en",
      });
    }
  };

  useEffect(() => {
    if (!isAuth) {
      showModal(<Auth typeInitial="SIGN_IN" />);
    }
  }, [isAuth, showModal]);

  if (isLoading || !paymentMethodsData) {
    return (
      <div className="not-mb:w-[600px] w-full h-full">
        <div className="flex flex-col gap-5 p-5 items-center justify-center min-h-[400px]">
          <p className="text-xl text-white flex items-center gap-2 text-center">
            {t("pay:title")}
          </p>
          <p className="bg-white p-[1px] w-full" />

          <div className="flex flex-col items-center justify-center flex-1 gap-4">
            <div className="w-8 h-8 border-2 border-green border-t-transparent rounded-full animate-spin"></div>
            <div className="text-white/70 text-sm">
              {t("pay:loadingPaymentMethods")}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="not-mb:w-[600px] w-full h-full">
      <div className="flex flex-col gap-5 p-5 items-center justify-center">
        <p className="text-xl text-white flex items-center gap-2 text-center">
          {t("pay:title")}
        </p>
        <p className="bg-white p-[1px] w-full" />

        <div className="flex flex-col gap-4 items-center justify-center w-full">
          {/* Выбор способа оплаты */}
          {paymentMethodsData && paymentMethodsData.length > 0 && (
            <div className="w-full">
              <div className="text-white/90 text-sm mb-2">
                {t("pay:paymentMethod")}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {/* Кнопка CRYPTO */}
                <button
                  onClick={() => {
                    setIsCryptoSelected(true);
                    setSelectedProvider(null);
                  }}
                  className={`p-3 rounded-lg border transition-colors ${
                    isCryptoSelected
                      ? "bg-green/20 border-green text-white"
                      : "bg-black-25 border-black-35 text-white/80 hover:bg-black-35"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-black">
                      ₿
                    </div>
                    <div>
                      <div className="text-sm font-semibold">CRYPTO</div>
                      <div className="text-xs text-green">
                        {t("pay:cryptoZeroFee")}
                      </div>
                    </div>
                  </div>
                </button>

                {paymentMethodsData.map((provider) => (
                  <button
                    key={provider.provider}
                    onClick={() => {
                      setSelectedProvider(provider.provider);
                      setIsCryptoSelected(false);
                    }}
                    className={`p-3 rounded-lg border transition-colors ${
                      selectedProvider === provider.provider &&
                      !isCryptoSelected
                        ? "bg-green/20 border-green text-white"
                        : "bg-black-25 border-black-35 text-white/80 hover:bg-black-35"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {provider.icon && (
                        <Image
                          src={`/cdn/pay/${provider.icon}.webp`}
                          alt={provider.provider}
                          className="w-6 h-6"
                          width={24}
                          height={24}
                        />
                      )}
                      <div>
                        <div className="text-sm font-semibold">
                          {provider.provider}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Информация о CRYPTO методе */}
          {isCryptoSelected && (
            <div className="w-full space-y-3">
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-black">
                    ₿
                  </div>
                  <div className="text-yellow-400 font-semibold">
                    {t("pay:cryptoTitle")}
                  </div>
                </div>
                <div className="text-white/90 text-sm space-y-2">
                  <p>
                    <strong>{t("pay:cryptoZeroFee")}</strong> -{" "}
                    {t("pay:cryptoZeroFeeDescription")}
                  </p>
                  <p>{t("pay:cryptoAutomationSoon")}</p>
                  <p>{t("pay:cryptoCurrentInstructions")}</p>
                  <div className="bg-black-25 border border-black-35 rounded-lg p-3 mt-2">
                    <p className="text-green font-medium mb-1">
                      1. {t("pay:cryptoStep1")}
                    </p>
                    <p className="text-white/80 text-sm mb-2">
                      2. {t("pay:cryptoStep2")}{" "}
                      <span className="text-yellow-400 font-semibold">GM</span>
                    </p>
                    <p className="text-white/80 text-sm">
                      3. {t("pay:cryptoStep3")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Информация о курсе и провайдере */}
          {currentProvider && !isCryptoSelected && (
            <div className="w-full space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-white/80 p1">
                  {t("pay:course")}:
                  <span className="text-white p2 ml-1">
                    1 USD = {currentProvider.rate} Credits
                  </span>
                </div>
              </div>
              <div className="text-white/80 p1">
                {t("pay:minPayment")}:
                <span className="text-white p2 ml-1">
                  {currentProvider.min} Credits
                </span>
              </div>

              {/* Информация о бонусах */}
              {currentProvider.bonus && currentProvider.bonus.length > 0 && (
                <div className="bg-black-25 border border-black-35 rounded-lg p-3">
                  <div className="text-white/90 text-sm mb-2">
                    {t("pay:availableBonuses")}:
                  </div>
                  <div className="space-y-1">
                    {currentProvider.bonus.map((bonus, index) => (
                      <div key={index} className="text-xs text-white/70">
                        {t("pay:bonusFrom")} {bonus.amount} Credits → +
                        {bonus.percent}% {t("pay:bonus")}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Ввод количества Credits - только для обычных методов */}
          {!isCryptoSelected && (
            <div className="w-full mt-4">
              <div className="text-white/90 text-sm mb-2">
                {t("pay:creditAmountWanted")}: Credits
                {currentProvider && (
                  <span className="text-white/60 text-xs ml-2">
                    ({t("pay:min")}: {currentProvider.min} Credits)
                  </span>
                )}
              </div>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*\.?[0-9]*"
                value={creditAmount}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^[0-9]*\.?[0-9]*$/.test(val)) {
                    setCreditAmount(val);
                  }
                }}
                onBlur={(e) => {
                  const value = e.currentTarget.value;
                  const numValue = Number(value);

                  if (!value || numValue < 0) {
                    setCreditAmount("0");
                  } else if (
                    currentProvider &&
                    numValue > 0 &&
                    numValue < parseFloat(currentProvider.min)
                  ) {
                    setCreditAmount(currentProvider.min);
                    showNotification(
                      `${t("pay:minAmount")}: ${currentProvider.min} Credits`,
                      "error",
                    );
                  }
                }}
                placeholder={`${t("pay:enterCreditAmount")} ${currentProvider ? `(${t("pay:min")}: ${currentProvider.min})` : ""}`}
                className={`w-full text-center border rounded-md py-3 px-4 text-lg ${
                  currentProvider &&
                  numericCreditAmount > 0 &&
                  numericCreditAmount < parseFloat(currentProvider.min)
                    ? "bg-red-900/20 border-red-500 text-white"
                    : "bg-black-25 border-black-35 text-white"
                }`}
              />
              {currentProvider &&
                numericCreditAmount > 0 &&
                numericCreditAmount < parseFloat(currentProvider.min) && (
                  <div className="text-red-400 text-xs mt-1">
                    {t("pay:amountMustBe")} {currentProvider.min} Credits
                  </div>
                )}
            </div>
          )}

          {/* Итоговый расчет для обычных методов */}
          {currentProvider && !isCryptoSelected && (
            <div className="w-full mt-2 p-3 rounded-lg bg-black-25 border border-black-35 text-white">
              <div className="p1 mb-1">
                {t("pay:youWillReceive")}:
                <span className="text-green font-semibold p1 ml-1">
                  {bonusInfo
                    ? bonusInfo.totalAmount.toFixed(0)
                    : creditAmount || "0"}{" "}
                  Credits
                </span>
                {bonusInfo && (
                  <span className="text-yellow-400 text-sm ml-2">
                    (+{bonusInfo.bonusAmount.toFixed(0)} {t("pay:bonus")}{" "}
                    {bonusInfo.percent}%)
                  </span>
                )}
              </div>
              <div className="p1 mt-1">
                {t("pay:amountToPay")}:
                <span className="font-semibold p1 ml-1">
                  {paymentAmount.toFixed(2)} USD
                </span>
              </div>
            </div>
          )}

          {/* Чекбокс согласия */}
          <div className="w-full mt-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-green bg-black-25 border-black-35 rounded focus:ring-green focus:ring-2"
              />
              <span className="text-white/80 text-sm leading-relaxed">
                {t("pay:iAgreeWith")}{" "}
                <a
                  href={appLink.agree}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green hover:text-green-1 underline transition-colors"
                >
                  {t("pay:agreement")}
                </a>{" "}
                {t("pay:agreementTwo")}
              </span>
            </label>
          </div>

          {/* Кнопка донейта */}
          <div className="w-full mt-4">
            <Button
              theme="green"
              isDisabled={
                isCryptoSelected
                  ? !agreeToTerms
                  : !numericCreditAmount ||
                    numericCreditAmount <= 0 ||
                    !agreeToTerms ||
                    (currentProvider &&
                      numericCreditAmount < parseFloat(currentProvider.min))
              }
              onClick={handleDonate}
              className={
                isCryptoSelected
                  ? "bg-yellow-500 hover:bg-yellow-600 border-yellow-500"
                  : ""
              }
            >
              {isCryptoSelected ? t("pay:cryptoGoToDiscord") : t("pay:donate")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pay;
