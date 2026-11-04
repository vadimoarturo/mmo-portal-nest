"use client";
import { catalogApi } from "@/features/catalog/infrastructure/api";


import { useTranslation } from "react-i18next";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ShopItemDTO } from "@/features/catalog/contracts/shop-items.dto";
import { Button } from "@/components/UI/Button";
import {
  parseBasePrice,
  parseSalePrice,
  formatNumber,
} from "@/core/helpers/getItemsInfo";
import { useAuth } from "@/core/providers/auth.provider";
import { useMutation } from "@tanstack/react-query";
import { ShopBuyDTO } from "@/features/catalog/contracts";
import { useNotification } from "@/core/providers/notify.provider";
import { GameServerName } from "@/types/enum";
import { Auth } from "@/features/identity/presentation/Auth";
import { useModal } from "@/core/providers/modal.provider";
import { ApiError } from "@/types/errors";
import { returnCodeError } from "@/core/helpers/returnCodeError";
import Pay from "@/features/payments/presentation/Pay";

const ShopItem = ({
  item,
  refetchBalance,
}: {
  item: ShopItemDTO;
  refetchBalance: () => void;
}) => {
  const { t } = useTranslation();
  const [packs, setPacks] = useState<number>(1);
  const { showNotification } = useNotification();
  const { isAuth } = useAuth();
  const { showModal, hideModal } = useModal();

  const itemCountPerPack = useMemo(() => {
    const parsed = Number(item.itemCount);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }, [item.itemCount]);

  const basePrice = useMemo(() => parseBasePrice(item.price), [item.price]);

  const salePrice = useMemo(() => parseSalePrice(item.sale), [item.sale]);

  useEffect(() => {
    if (!item.isStack) {
      setPacks(1);
    }
  }, [item.isStack]);

  const totalUnits = packs * itemCountPerPack;
  const totalBase = packs * basePrice;
  const totalSale = salePrice !== null ? packs * (salePrice as number) : null;

  const numberFormatter = useMemo(() => new Intl.NumberFormat("ru-RU"), []);
  const formatted = {
    basePerPack: formatNumber(basePrice, "ru-RU"),
    salePerPack:
      salePrice !== null ? formatNumber(salePrice as number, "ru-RU") : null,
    totalBase: formatNumber(totalBase, "ru-RU"),
    totalSale:
      totalSale !== null ? formatNumber(totalSale as number, "ru-RU") : null,
  };

  const { mutate: buyShopItemApi, isPending } = useMutation({
    mutationKey: ["buyShopItem"],
    mutationFn: (data: ShopBuyDTO) => catalogApi.buyShopItem(data),
    onSuccess: () => {
      showNotification(t("shop:buy.success"), "success");
      refetchBalance();
      hideModal();
    },
    onError: (error: ApiError) => {
      const codeError = returnCodeError(error);
      showNotification(t("shop:buy.error"), "error", codeError);
      if (codeError === "USER_INSUFFICIENT_FUNDS") {
        showModal(<Pay />);
      }
    },
  });

  const buyShopItem = (data: ShopBuyDTO) => {
    if (!isAuth) {
      showNotification(t("errors:notify.auth"), "error");
      showModal(<Auth typeInitial="SIGN_IN" />);
      return;
    }
    buyShopItemApi(data);
  };

  return (
    <div className="not-mb:w-[600px] w-full h-full">
      <div className="flex flex-col gap-5 p-5 items-center justify-center">
        <p className="text-xl text-white flex items-center gap-2">
          {item.info.title}
        </p>
        <p className="bg-white p-[1px] w-full" />
        <div className="flex flex-col gap-4 items-center justify-center w-full">
          {item.image ? (
            <Image
              className="cursor-pointer w-full h-auto rounded-md group-hover:scale-105 transition-transform duration-200"
              sizes="150vw"
              src={`/cdn/shop/${item.image}.jpg`}
              width={0}
              height={0}
              alt={""}
            />
          ) : item.icon ? (
            <Image
              className="cursor-pointer rounded-md group-hover:scale-105 transition-transform duration-200"
              src={`/cdn/shop/${item.icon}.jpg`}
              width={32}
              height={32}
              alt={""}
            />
          ) : null}
          {item.info.text.includes(";") ? (
            <ul className="break-words text-white list-disc pl-5">
              {item.info.text.split(";").map((part, idx) => {
                const text = part.trim();
                return text ? <li key={idx}>{text}</li> : null;
              })}
            </ul>
          ) : (
            <p className="break-words text-white">{item.info.text}</p>
          )}
          <div className="w-full grid grid-cols-2 gap-2 mt-2">
            <div className="text-white/80 p1">
              {t("shop:item.level")}:{" "}
              <span className="text-white p2">{item.level || "0"}</span>
            </div>
            <div className="text-white/80 p1">
              {t("shop:item.lifeTime")}:{" "}
              <span className="text-white p2">
                {item.lifeTime || ""} {t(`shop:lifeType.${item.lifeType}`)}
              </span>
            </div>
            <div className="text-white/80 p1">
              {t("shop:item.isMove")}:{" "}
              <span className="text-white p2">
                {item.isMove ? "Да" : "Нет"}
              </span>
            </div>
          </div>

          {item.isStack ? (
            <div className="w-full mt-4 flex items-center justify-between">
              <div className="text-white/90 text-sm">
                {t("shop:item.count")}
              </div>
              <div className="flex items-center gap-3">
                <button
                  aria-label="Уменьшить"
                  onClick={() => setPacks((v) => Math.max(1, v - 1))}
                  className="px-3 py-1 rounded-md bg-black-35 hover:bg-black-25 text-white border border-black-35"
                >
                  -
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={packs}
                  onChange={(e) => {
                    const val = parseInt(e.target.value || "0", 10);
                    setPacks(Number.isFinite(val) && val >= 0 ? val : 0);
                  }}
                  onBlur={(e) => {
                    if (
                      !e.currentTarget.value ||
                      Number(e.currentTarget.value) < 0
                    )
                      setPacks(0);
                  }}
                  className="w-20 text-center bg-black-25 border border-black-35 text-white rounded-md py-1"
                />
                <button
                  aria-label="Увеличить"
                  onClick={() => setPacks((v) => v + 1)}
                  className="px-3 py-1 rounded-md bg-black-35 hover:bg-black-25 text-white border border-black-35"
                >
                  +
                </button>
              </div>
            </div>
          ) : null}

          <div className="w-full mt-2 p-3 rounded-lg bg-black-25 border border-black-35 text-white">
            <div className="p1 mb-1">
              {t("shop:item.total")}:{" "}
              <span className="font-semibold p1">
                {numberFormatter.format(totalUnits)}
              </span>
            </div>
            {salePrice === null ? (
              <div className="p1 mt-1">
                {t("shop:item.totalPayment")}:{" "}
                <span className="text-green font-semibold p1">
                  {formatted.totalBase} Credits
                </span>
              </div>
            ) : (
              <div className="text-lg mt-1 flex items-center gap-2">
                {t("shop:item.totalPayment")}:
                <span className="line-through opacity-70 text-green p1">
                  {formatted.totalBase} Credits
                </span>
                <span className="font-semibold text-yellow-300 p1">
                  {formatted.totalSale} Credits
                </span>
              </div>
            )}
            <div className="p2 text-white/70 mt-1">
              {t("shop:item.pricePerItem")}:{" "}
              {salePrice === null ? (
                <span className="text-green p2">
                  {formatted.basePerPack} Credits
                </span>
              ) : (
                <>
                  <span className="line-through opacity-70 text-green p2">
                    {formatted.basePerPack} Credits
                  </span>
                  <span className="ml-2 text-yellow-300 p2">
                    {formatted.salePerPack} Credits
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Действия */}
          <div className="w-full mt-4">
            <Button
              theme="green"
              className="h-[48px]"
              isDisabled={totalUnits === 0}
              showLoader={isPending}
              onClick={() =>
                buyShopItem({
                  itemId: item.itemId,
                  count: totalUnits,
                  serverName: GameServerName.MMO,
                })
              }
            >
              {t("button:get")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopItem;
