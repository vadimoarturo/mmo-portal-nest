"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import LanguageChanger from "@/components/UI/LanguageChanger";
import { appLink } from "@/components/Content/Header/constants";
import { Logo } from "@/components/UI/Logo";
import { useModal } from "@/core/providers/modal.provider";
import { Auth } from "@/features/identity/presentation/Auth";
import { useAuth } from "@/core/providers/auth.provider";
import ServerInfo from "@/components/Content/ServerInfo";
import Pay from "@/features/payments/presentation/Pay";
import Download from "@/components/UI/Modal/Content/Download";
import EmailVerificationBanner from "@/components/Content/Header/EmailVerificationBanner";

const Header = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { showModal } = useModal();
  const { isAuth, getUser, isVerifyEmail, logOut } = useAuth();

  const HeaderNavs = [
    {
      value: t("header:link.wiki"),
      href: appLink.wiki,
      type: "link",
    },
    {
      value: t("header:link.shop"),
      href: appLink.shop,
      type: "link",
    },
    {
      value: t("header:link.auction"),
      href: appLink.auction,
      type: "link",
    },
    {
      value: t("header:link.donate"),
      type: "modal",
      modal: <Pay />,
    },
    {
      value: t("header:link.download"),
      type: "modal",
      modal: <Download />,
    },
    {
      value: "Discord",
      target: "_blank",
      href: appLink.discord,
      type: "link",
    },
    {
      value: "Telegram",
      target: "_blank",
      href: appLink.telegram,
      type: "link",
    },
  ].filter((item) => item.type === "modal" || item.href);

  return (
    <header className="realm-header">
      <ServerInfo />
      {isAuth && !isVerifyEmail && <EmailVerificationBanner />}

      <div className="w-full grid grid-cols-10 mb:grid-cols-6 items-center p-[20px] gap-[20px] mb:p-[10px] mb:gap-[10px]">
        <div className="col-span-2 mb:col-span-2 flex justify-center items-center">
          <Logo
            classNameTitle="text-[23px] mb:text-[17px]"
            classNameSub="text-[13px] mb:hidden"
            onClick={() => router.push(appLink.home)}
          />
        </div>
        <nav className="col-span-6 mb:col-span-2 flex items-center justify-center gap-[10px]">
          <div className="flex items-center justify-center gap-10 mb:hidden">
            {HeaderNavs.map(({ href, value, target, type, modal }) => (
              <div
                key={value}
                className="cursor-pointer uppercase text-white hover:text-white/50 button_small mb:button_medium"
              >
                {type === "modal" ? (
                  <span onClick={() => showModal(modal)}>{value}</span>
                ) : href ? (
                  <Link target={target} href={href}>
                    {value}
                  </Link>
                ) : (
                  value
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2 not-mb:hidden">
            <span
              className="text-white cursor-pointer hover:text-gray uppercase"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {t("header:menu")}
            </span>
          </div>
        </nav>
        <div className="col-span-2 mb:col-span-2 flex justify-center items-center gap-4 mb:gap-1">
          {isAuth ? (
            <div className="flex items-center gap-3 mb:gap-1 mb:flex-col">
              <div className="flex items-center gap-2 flex-col mb:gap-0">
                <p
                  onClick={() => showModal(<Pay />)}
                  className="text-white p1 mb:p2  cursor-pointer"
                >
                  {getUser}
                </p>
              </div>
              <p
                className="text-white cursor-pointer hover:text-gray uppercase p2 mb:text-[10px]"
                onClick={() => logOut()}
              >
                {t("auth:logout")}
              </p>
            </div>
          ) : (
            <span
              className="text-white cursor-pointer hover:text-gray uppercase p1 button_small mb:button_medium"
              onClick={() => showModal(<Auth typeInitial="SIGN_IN" />)}
            >
              {t("auth:types.SIGN_IN")}
            </span>
          )}
          <div className="mb:scale-75">
            <LanguageChanger />
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="w-full bg-transparent p-4 not-mb:hidden overflow-x-auto">
          <div className="flex flex-row items-center justify-center gap-4">
            {HeaderNavs.map(({ href, value, target, type, modal }) => (
              <p
                key={value}
                className="cursor-pointer uppercase text-white hover:text-white/50 button_small mb:p2"
              >
                {type === "modal" ? (
                  <span onClick={() => showModal(modal)}>{value}</span>
                ) : href ? (
                  <Link target={target} href={href}>
                    {value}
                  </Link>
                ) : (
                  value
                )}
              </p>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
