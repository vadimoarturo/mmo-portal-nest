import { Outfit, Cinzel } from "next/font/google";
import "./globals.css";
import { CookiesProvider } from "next-client-cookies/server";
import initTranslations from "@/app/i18n";
import TranslationsProvider from "@/core/providers/translations.provider";
import ReactQueryProvider from "@/core/providers/react-query.provider";
import { AuthProvider } from "@/core/providers/auth.provider";
import { NotificationProvider } from "@/core/providers/notify.provider";
import Header from "@/components/Content/Header";
import { Metadata } from "next";
import { ModalProvider } from "@/core/providers/modal.provider";
import Modal from "@/components/UI/Modal";
import { Footer } from "@/components/Content/Footer";

const displayFont = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});

const uncialAntiqua = Outfit({
  weight: "400",
  subsets: ["latin"],
});

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

const i18nNamespaces = [
  "welcome",
  "auth",
  "errors",
  "input",
  "button",
  "shop",
  "header",
  "wiki",
  "agree",
  "seo",
  "pay",
  "auction",
  "download",
];

export async function generateMetadata({
  params,
}: RootLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const { t, supportedLngs } = await initTranslations(locale, ["seo"]);
  const formattedLanguage = (lang: string) =>
    `${lang.toLowerCase()}_${lang.toUpperCase()}`;
  const language = formattedLanguage(locale);
  const languages = supportedLngs
    .filter((lang) => lang !== locale)
    .map((lang) => formattedLanguage(lang));

  return {
    openGraph: {
      locale: language,
      alternateLocale: [...languages],
    },
    title: t("seo:title"),
    description: t("seo:description"),
  };
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const { locale } = await params;
  const { resources } = await initTranslations(locale, i18nNamespaces);
  return (
    <TranslationsProvider
      namespaces={i18nNamespaces}
      locale={locale}
      resources={resources}
    >
      <html lang={locale}>
        <body className={`${uncialAntiqua.className} ${displayFont.variable}`}>
          <ReactQueryProvider>
            <CookiesProvider>
              <ModalProvider>
                <AuthProvider>
                  <NotificationProvider>
                    <div className="min-h-screen bg-[#080c15] relative">
                      <Header />
                      <Modal />
                      <main className="relative z-10">{children}</main>
                      <Footer />
                    </div>
                  </NotificationProvider>
                </AuthProvider>
              </ModalProvider>
            </CookiesProvider>
          </ReactQueryProvider>
        </body>
      </html>
    </TranslationsProvider>
  );
}
