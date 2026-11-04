"use client";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { appLink } from "../Header/constants";

export const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="realm-footer relative z-10 text-white/50">
      <div className="max-w-7xl mx-auto p-10 flex mb:flex-col gap-8 justify-between items-center">
        <div>
          <p className="text-white text-xl font-bold">mmo-portal</p>
          <p className="text-xs mt-2">Forge your legend.</p>
        </div>
        <nav className="flex flex-wrap justify-center gap-6 text-sm">
          <Link href={appLink.wiki}>{t("header:link.wiki")}</Link>
          <Link href={appLink.shop}>{t("header:link.shop")}</Link>
          <Link href={appLink.auction}>{t("header:link.auction")}</Link>
          <Link href={appLink.agree}>{t("header:footer.link.agreement")}</Link>
          {appLink.discord && (
            <a href={appLink.discord} target="_blank" rel="noopener noreferrer">
              Discord
            </a>
          )}
          {appLink.telegram && (
            <a
              href={appLink.telegram}
              target="_blank"
              rel="noopener noreferrer"
            >
              Telegram
            </a>
          )}
        </nav>
        <p className="text-xs">© {new Date().getFullYear()} mmo-portal</p>
      </div>
    </footer>
  );
};
