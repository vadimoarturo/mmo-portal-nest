"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { BackendApiService } from "@/core/services/api";
import { useNotification } from "@/core/providers/notify.provider";
import { ApiError } from "@/types/errors";
import { returnCodeError } from "@/core/helpers/returnCodeError";

const EmailVerificationBanner = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const [cooldown, setCooldown] = useState(0);

  const { mutate: resendEmail, isPending } = useMutation({
    mutationFn: BackendApiService.resendVerifyEmail,
    onSuccess: () => {
      showNotification(t("auth:emailVerification.emailSent"), "success");
      setCooldown(60);
    },
    onError: (error: ApiError) => {
      const codeError = returnCodeError(error);
      showNotification(
        t("auth:emailVerification.emailError"),
        "error",
        codeError,
      );
    },
  });

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => {
        setCooldown(cooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResend = () => {
    if (cooldown === 0 && !isPending) {
      resendEmail();
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white shadow-lg border-b-2 border-red-700">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Основной контент баннера */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb:gap-2">
          {/* Левая часть с иконкой и заголовком */}
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white animate-pulse"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold mb:text-base">
                {t("auth:emailVerification.title")}
              </h3>
              <p className="text-sm opacity-90 mb:text-xs">
                {t("auth:emailVerification.gameBlocked")}
              </p>
            </div>
          </div>

          {/* Правая часть с кнопкой */}
          <div className="flex items-center gap-4 mb:gap-2">
            <button
              onClick={handleResend}
              disabled={cooldown > 0 || isPending}
              className={`px-6 py-2.5 font-semibold rounded-lg transition-all duration-200 shadow-lg mb:px-4 mb:py-2 mb:text-sm ${
                cooldown > 0 || isPending
                  ? "bg-gray-600 bg-opacity-50 cursor-not-allowed text-gray-300"
                  : "bg-white text-red-600 hover:bg-gray-100 hover:shadow-xl transform hover:scale-105"
              }`}
            >
              {cooldown > 0 ? (
                t("auth:emailVerification.resendCooldown", {
                  seconds: cooldown,
                })
              ) : isPending ? (
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>{t("auth:emailVerification.sending")}</span>
                </div>
              ) : (
                t("auth:emailVerification.resendButton")
              )}
            </button>
          </div>
        </div>

        {/* Дополнительное предупреждение */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white border-opacity-20">
          <svg
            className="w-4 h-4 text-yellow-200 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm text-yellow-100 mb:text-xs">
            <strong>{t("auth:emailVerification.warning")}</strong>{" "}
            {t("auth:emailVerification.warningMessage")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;
