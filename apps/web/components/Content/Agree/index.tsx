"use client";
import { useTranslation } from "react-i18next";

export const Agree = () => {
  const { t } = useTranslation("agree");

  // Функция для безопасного получения массивов из переводов
  const getTranslationArray = (key: string): string[] => {
    const result = t(key, { returnObjects: true });
    return Array.isArray(result)
      ? result.filter((item): item is string => typeof item === "string")
      : [];
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        {t("title")}
      </h1>

      <div className="space-y-6 text-gray-700 leading-relaxed">
        {/* Важное уведомление о тестовом режиме */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{t("testModeWarning")}</p>
            </div>
          </div>
        </div>

        <div className="prose max-w-none">
          <p className="text-base">{t("intro")}</p>

          <h2 className="text-xl font-semibold mt-6 mb-4">
            1. {t("sections.generalProvisions.title")}
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            {getTranslationArray("sections.generalProvisions.items").map(
              (item: string, index: number) => (
                <li key={index}>{item}</li>
              ),
            )}
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-4">
            2. {t("sections.userRights.title")}
          </h2>

          <h3 className="text-lg font-medium mt-4 mb-2">
            {t("sections.userRights.obligations.title")}
          </h3>
          <ul className="list-disc pl-6 space-y-2">
            {getTranslationArray("sections.userRights.obligations.items").map(
              (item: string, index: number) => (
                <li key={index}>{item}</li>
              ),
            )}
          </ul>

          <h3 className="text-lg font-medium mt-4 mb-2">
            {t("sections.userRights.prohibitions.title")}
          </h3>
          <ul className="list-disc pl-6 space-y-2">
            {getTranslationArray("sections.userRights.prohibitions.items").map(
              (item: string, index: number) => (
                <li key={index}>{item}</li>
              ),
            )}
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-4">
            3. {t("sections.adminRights.title")}
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            {getTranslationArray("sections.adminRights.items").map(
              (item: string, index: number) => (
                <li key={index}>{item}</li>
              ),
            )}
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-4">
            4. {t("sections.donationPolicy.title")}
          </h2>

          {/* Информация о Credits */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
            <p className="text-blue-700">
              {t("sections.donationPolicy.creditInfo")}
            </p>
          </div>

          {/* Правила возврата */}
          <h3 className="text-lg font-medium mt-4 mb-2">
            {t("sections.donationPolicy.refundRules.title")}
          </h3>
          <p className="mb-3">
            {t("sections.donationPolicy.refundRules.description")}
          </p>
          <ul className="list-disc pl-6 space-y-2">
            {getTranslationArray(
              "sections.donationPolicy.refundRules.requirements",
            ).map((item: string, index: number) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-4">
            5. {t("sections.responsibility.title")}
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            {getTranslationArray("sections.responsibility.items").map(
              (item: string, index: number) => (
                <li key={index}>{item}</li>
              ),
            )}
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-4">
            6. {t("sections.gameRules.title")}
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            {getTranslationArray("sections.gameRules.items").map(
              (item: string, index: number) => (
                <li key={index}>{item}</li>
              ),
            )}
          </ul>

          <div className="mt-8 p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">{t("finalNote")}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
