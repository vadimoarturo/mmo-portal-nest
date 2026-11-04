import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";
import RuSvg from "./svg/ru.svg";
import UsSvg from "./svg/us.svg";
import { usePathname } from "next/navigation";
import i18nConfig from "@/i18n/i18nConfig";

export default function LanguageChanger() {
  const { i18n } = useTranslation();
  const currentLocale = i18n.language;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentPathname = usePathname();

  const handleChange = (newLocale: string) => {
    let newUrl;

    if (
      currentLocale === i18nConfig.defaultLocale &&
      !i18nConfig.prefixDefault
    ) {
      newUrl = "/" + newLocale + currentPathname;
    } else {
      newUrl = currentPathname.replace(`/${currentLocale}`, `/${newLocale}`);
    }

    setIsOpen(false);
    window.location.href = newUrl;
  };

  const getFlagComponent = (locale: string) => {
    switch (locale) {
      case "en":
        return <UsSvg width={21} height={15} />;
      case "ru":
        return <RuSvg width={21} height={15} />;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div>
        <button
          type="button"
          className="items-center justify-center flex"
          id="options-menu"
          aria-haspopup="true"
          aria-label="change language"
          aria-expanded={isOpen ? "true" : "false"}
          onClick={() => setIsOpen(!isOpen)}
        >
          {getFlagComponent(currentLocale)}
        </button>
      </div>
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-1 w-[150px] rounded-md shadow-lg bg-black-1 ring-1 ring-black ring-opacity-5 focus:outline-none ">
          <div
            className="py-1 flex flex-col justify-center items-center"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            {[
              { locale: "en", label: "English", Svg: UsSvg },
              { locale: "ru", label: "Русский", Svg: RuSvg },
            ].map(({ locale, label, Svg }) => (
              <button
                key={locale}
                onClick={() => handleChange(locale)}
                aria-label={locale}
                className="uppercase flex items-center w-full px-4 py-2 text-sm text-white hover:bg-gray-1"
                role="menuitem"
              >
                <Svg width={21} height={16} className="mr-2 rounded-[3px]" />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
