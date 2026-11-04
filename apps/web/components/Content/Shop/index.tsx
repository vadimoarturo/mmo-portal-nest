"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Skeleton from "@/components/UI/Skeleton";
import Image from "next/image";
import ShopItem from "../../UI/Modal/Content/ShopItem";
import { BackendApiService } from "@/core/services/api";
import { ShopItemDTO, ShopItemsDTO } from "@/types/dto/shop/shop-items.dto";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/UI/Button";
import { useModal } from "@/core/providers/modal.provider";
import { useAuth } from "@/core/providers/auth.provider";
import {
  localizeItemsInfo,
  parseBasePrice,
  parseSalePrice,
} from "@/core/helpers/getItemsInfo";
import Pay from "@/components/UI/Modal/Content/Pay";

enum GameServerName {
  MMO = "MMO",
}

const Shop = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState<number>(1);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [itemsData, setItemsData] = useState<ShopItemsDTO | null>(null);
  const { i18n } = useTranslation();
  const { showModal } = useModal();
  const { isAuth } = useAuth();
  const [balance, setBalance] = useState<string>("0");

  const { data: balanceData, refetch: refetchUserBalance } = useQuery({
    queryKey: ["getBalance"],
    queryFn: () => BackendApiService.getBalance(),
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

  const { data: categoryData, isSuccess: isCategorySuccess } = useQuery({
    queryKey: ["category"],
    queryFn: () => BackendApiService.getShopCategory(),
    refetchOnWindowFocus: false,
    enabled: true,
  });

  useEffect(() => {
    if (categoryData && categoryData[GameServerName.MMO]) {
      setCategories(categoryData[GameServerName.MMO]);
      setSelectedCategory(categoryData[GameServerName.MMO][0] || "");
      setPage(1);
    }
  }, [categoryData]);

  useEffect(() => {
    setPage(1);
  }, [selectedCategory]);

  const { data: itemsDataRaw, isLoading: itemsLoading } =
    useQuery<ShopItemsDTO>({
      queryKey: ["shop-items", selectedCategory, page],
      queryFn: () =>
        BackendApiService.getShopItems({
          categoryId: selectedCategory,
          page,
          serverName: GameServerName.MMO,
        }),
      enabled: !!selectedCategory,
      placeholderData: (previousData) =>
        previousData as ShopItemsDTO | undefined,
    });

  useEffect(() => {
    if (itemsDataRaw) {
      const dataModified = localizeItemsInfo(itemsDataRaw.data, i18n.language);
      setItemsData({
        ...itemsDataRaw,
        data: dataModified,
      });
    }
  }, [itemsDataRaw, i18n.language]);

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (itemsData && itemsData.totalPages && page < itemsData.totalPages)
      setPage(page + 1);
  };

  return (
    <div className="flex items-start justify-center min-h-screen w-full p-5">
      <div className="flex flex-row gap-4 w-full">
        {/* Слева категории */}
        <div className="hidden not-mb:flex not-mb:w-1/4 flex-col gap-4 h-full">
          {/* Блок баланса */}
          {isAuth && (
            <div className="bg-gradient-to-br from-black-80 to-black-2 rounded-lg p-2.5 backdrop-blur border border-gray-35 shadow-lg shadow-black/30">
              <div className="text-center">
                <p className="text-white/70 text-xs mb-0.5">
                  {t("shop:balance.current")}
                </p>
                <p className="text-green font-bold text-base mb-1.5">
                  {balance} Credits
                </p>
                <button
                  className="bg-green/70 hover:bg-green text-black-2 font-semibold px-2.5 py-1 rounded text-xs transition-colors"
                  onClick={() => showModal(<Pay />)}
                >
                  {t("shop:balance.topUp")}
                </button>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-black-80 to-black-2 h-full rounded-xl p-4 backdrop-blur border border-gray-35 sticky top-5 shadow-lg shadow-black/30">
            <div className="mb-4">
              <h3 className="text-white-1 text-lg font-semibold tracking-wide">
                {t("shop:category.title")}
              </h3>
            </div>
            <div className="max-h-[70vh] overflow-y-auto pr-1 scrollbar-none">
              {isCategorySuccess && categories.length ? (
                <ul className="text-white-1 uppercase w-full space-y-1">
                  {categories.map((item, idx) => (
                    <li
                      key={idx}
                      className={`px-3 py-2 rounded-md transition-colors duration-200 cursor-pointer ${selectedCategory === item ? "bg-black-35 text-white-1" : "text-white hover:bg-black-25 hover:text-white-1"}`}
                      onClick={() => setSelectedCategory(item)}
                    >
                      {t(`shop:category.${item}`)}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col gap-3 w-full">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <Skeleton
                      key={idx}
                      style={"rounded"}
                      className={"w-full h-8"}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Справа айтемы выбранной категории */}
        <div className="bg-gradient-to-br from-black-80 to-black-2 w-full not-mb:w-3/4 h-full rounded-xl p-4 flex flex-col backdrop-blur border border-gray-35 shadow-lg shadow-black/30">
          {/* Мобильный блок баланса */}
          {isAuth && (
            <div className="mb:block not-mb:hidden mb-3 bg-gradient-to-br from-black-80 to-black-2 rounded-lg p-2.5 backdrop-blur border border-gray-35 shadow-lg shadow-black/30">
              <div className="text-center">
                <p className="text-white/70 text-xs mb-0.5">
                  {t("shop:balance.current")}
                </p>
                <p className="text-green font-bold text-base mb-1.5">
                  {balance} Credits
                </p>
                <button
                  className="bg-green/70 hover:bg-green text-black-2 font-semibold px-2.5 py-1 rounded text-xs transition-colors"
                  onClick={() => showModal(<Pay />)}
                >
                  {t("shop:balance.topUp")}
                </button>
              </div>
            </div>
          )}

          {/* Мобильная панель категорий сверху */}
          {isCategorySuccess && categories.length ? (
            <div className="mb:block not-mb:hidden -mx-1 mb-3 overflow-x-auto scrollbar-none">
              <div className="px-1 flex items-center gap-2 whitespace-nowrap">
                {categories.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedCategory(item)}
                    className={`px-3 py-2 rounded-full p1 transition-colors border uppercase ${selectedCategory === item ? "bg-black-3 text-white-1 border-gray-35" : "bg-black-2 text-white-2 border-black-35 hover:bg-black-3"}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-35">
            <div className="flex items-center gap-2 text-white-1">
              <span className="p1 uppercase text-white-50">
                {t("shop:category.title")}:
              </span>
              <span className="font-semibold p1 uppercase">
                {t(`shop:category.${selectedCategory}`)}
              </span>
            </div>
            <span className="p1 text-white-50">
              Страница {page}
              {itemsData?.totalPages ? ` / ${itemsData.totalPages}` : ""}
            </span>
          </div>
          <div className="grid grid-cols-2 mb:grid-cols-2 not-mb:grid-cols-3 not-xl:grid-cols-4 gap-5 flex-grow">
            {itemsLoading ? (
              Array.from({ length: 16 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex justify-center items-center bg-black-25 text-white-1 p-3 rounded-xl text-center border border-black-35"
                >
                  <div className="flex flex-col justify-center items-center gap-2 w-full h-full">
                    <Skeleton style={"rounded"} className={"w-24 h-24"} />
                  </div>
                </div>
              ))
            ) : itemsData && itemsData.data && itemsData.data.length ? (
              itemsData.data.map((item: ShopItemDTO) => {
                const basePrice = parseBasePrice(item.price);
                const salePrice = parseSalePrice(item.sale);
                return (
                  <div
                    onClick={() =>
                      showModal(
                        <ShopItem
                          item={item}
                          refetchBalance={refetchBalance}
                        />,
                      )
                    }
                    key={item.itemId}
                    className="group relative flex justify-center items-center bg-black-1 hover:bg-gray-1 text-white-1 p-2 rounded-lg text-center transition-all duration-200 border border-gray-1 hover:border-gray-35 shadow-sm hover:shadow-md cursor-pointer h-48"
                  >
                    <div className="flex flex-col justify-between items-center w-full h-full">
                      <div className="flex flex-col w-full items-center justify-center gap-1 flex-grow">
                        <p className="p1 font-medium text-white-1 break-words max-w-[200px] leading-tight">
                          {item.info.title}
                        </p>
                        <p className="bg-white p-[1px] w-1/2 mx-auto" />
                      </div>
                      <div className="flex flex-col justify-center items-center gap-2 flex-shrink-0">
                        <Image
                          className="cursor-pointer rounded-md group-hover:scale-105 transition-transform duration-200"
                          src={`/cdn/shop/${item.icon}.jpg`}
                          width={41}
                          height={41}
                          alt={""}
                        />
                        {salePrice !== null ? (
                          <div className="flex items-center gap-1">
                            <span className="line-through opacity-90 text-green font-mono p1">
                              {basePrice} Credits
                            </span>
                            <span className="font-mono p1 bg-yellow-300 text-black-2 px-1 py-0.5 rounded">
                              {salePrice} Credits
                            </span>
                          </div>
                        ) : (
                          <p className="font-mono p1 bg-green-1/90 text-black-2 px-1 py-0.5 rounded">
                            {basePrice} Credits
                          </p>
                        )}
                      </div>
                      <div className="w-full flex-shrink-0 mt-2">
                        <Button
                          className="max-w-[250px] w-full"
                          onClick={() =>
                            showModal(
                              <ShopItem
                                item={item}
                                refetchBalance={refetchBalance}
                              />,
                            )
                          }
                        >
                          {t("button:get")}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-white-1 col-span-2 not-mb:col-span-3 not-xl:col-span-4 text-center py-10 opacity-80">
                {t("shop:item.noItems")}
              </div>
            )}
          </div>
          {/* Пагинация */}
          {itemsData && itemsData.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={handlePrevPage}
                disabled={page === 1}
                className="p1 inline-flex items-center px-4 py-2 rounded-lg bg-black-35 hover:bg-black-25 text-white-1 disabled:opacity-50 border border-black-35 transition"
              >
                {t("button:pagination.prev")}
              </button>
              <span className="text-white/90 p1">
                {page} / {itemsData.totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={page === itemsData.totalPages}
                className="p1 inline-flex items-center px-4 py-2 rounded-lg bg-black-35 hover:bg-black-25 text-white-1 disabled:opacity-50 border border-black-35 transition"
              >
                {t("button:pagination.next")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
