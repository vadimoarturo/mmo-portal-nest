"use client";
import { useNotification } from "@/core/providers/notify.provider";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import Shop from "@/features/catalog/presentation/Shop";
import { useRouter } from "next/navigation";

export default function ShopPage() {
  const { showNotification } = useNotification();
  const { t } = useTranslation();
  const router = useRouter();
  useEffect(() => {
    showNotification(t("errors:notify.pay.success"), "success");

    // Очищаем URL от параметров
    window.history.replaceState({}, "", window.location.pathname);
    router.push("/shop");
  }, [router, showNotification, t]);

  return <Shop />;
}
