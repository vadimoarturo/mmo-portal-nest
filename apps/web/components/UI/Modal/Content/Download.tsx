"use client";
import React from "react";
import { useTranslation } from "react-i18next";
import Image from "next/image";

interface IProps {
  icon: string;
  label: string;
  url: string;
  alt: string;
}

const DownloadButton = ({ icon, label, url, alt }: IProps) => {
  const handleClick = () => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handleClick}
      className="p-3 rounded-lg border bg-black-2 border-black-35 text-white hover:bg-black-35 transition-colors w-full"
    >
      <div className="flex items-center gap-3">
        <Image
          src={icon}
          alt={alt}
          className="w-8 h-8"
          width={32}
          height={32}
        />
        <div className="text-sm font-semibold uppercase">{label}</div>
      </div>
    </button>
  );
};

const Download = () => {
  const { t } = useTranslation();

  const clientDownloadLinks: IProps[] = [
    {
      icon: "/images/portal-mark.svg",
      label: "CLIENT",
      url: process.env.NEXT_PUBLIC_CLIENT_DOWNLOAD_URL || "",
      alt: "Game client",
    },
    {
      icon: "/images/portal-mark.svg",
      label: "TORRENT",
      url: process.env.NEXT_PUBLIC_CLIENT_TORRENT_URL || "",
      alt: "Torrent",
    },
  ].filter((link) => link.url);
  const driversDownloadLinks: IProps[] = [];

  return (
    <div className="flex flex-col gap-5 not-mb:w-[500px] w-full h-full p-10 mb:p-5 items-center">
      <div className="text-center">
        <h4 className="text-white text-xl mb-2">{t("download:title")}</h4>
        <p className="text-gray text-sm">{t("download:info")}</p>
      </div>

      <div className="flex flex-col gap-6 w-full">
        {/* Информационный блок */}
        <div className="w-full p-4 rounded-lg bg-black-2 border border-black-35">
          <div className="text-white/90 text-sm space-y-3">
            <div>
              <p className="font-semibold mb-2">
                {t("download:instructions.title")}:
              </p>
              <ul className="space-y-2 text-white/80 p1">
                <li>• {t("download:instructions.launcher")}</li>
                <li>• {t("download:instructions.antivirus")}</li>
                <li>• {t("download:instructions.support")}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Секция скачивания клиента */}
        <div className="w-full">
          <h5 className="text-white text-lg mb-3 text-center">
            {t("download:client")}
          </h5>
          <div className="flex flex-col gap-2">
            {clientDownloadLinks.map((link, index) => (
              <DownloadButton key={index} {...link} />
            ))}
          </div>
        </div>

        {/* Секция скачивания драйверов */}
        <div className="w-full">
          <h5 className="text-white text-lg mb-3 text-center">
            {t("download:drivers")}
          </h5>
          <div className="flex flex-col gap-2">
            {driversDownloadLinks.map((link, index) => (
              <DownloadButton key={index} {...link} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Download;
