import { ShopItemDTO } from "@/features/catalog/contracts/shop-items.dto";

export const localizeItemsInfo = (
  items: ShopItemDTO[] | undefined,
  lang: string,
) => {
  if (!items || items.length === 0) return [] as ShopItemDTO[];
  return items.map((item) => {
    const infoObj =
      typeof item.info === "string" ? JSON.parse(item.info) : item.info;
    const { title, text } = (infoObj?.[lang] ||
      infoObj?.["ru"] || { title: "", text: "" }) as {
      title: string;
      text: string;
    };
    return {
      ...item,
      info: { title, text },
    } as ShopItemDTO;
  });
};

export const parseSalePrice = (sale: unknown): number | null => {
  const s = String(sale ?? "").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : null;
};

export const parseBasePrice = (price: unknown): number => {
  const n = Number(price);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

export const calcDiscountPercent = (
  basePrice: number,
  salePrice: number | null,
): number | null => {
  if (salePrice === null || basePrice <= 0) return null;
  const perc = Math.round((1 - salePrice / basePrice) * 100);
  return Number.isFinite(perc) && perc > 0 ? perc : null;
};

export const formatNumber = (value: number, locale: string = "ru-RU") =>
  new Intl.NumberFormat(locale).format(value);
