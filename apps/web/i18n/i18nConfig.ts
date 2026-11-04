import { Config } from "next-i18n-router/dist/types";

const i18nConfig: Config = {
  locales: ["en", "ru"],
  defaultLocale: "ru",
  prefixDefault: true,
  localeCookie: "locale",
};

export default i18nConfig;
