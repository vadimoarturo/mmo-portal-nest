"use client";
import { identityApi } from "@/features/identity/infrastructure/api";


import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useNotification } from "@/core/providers/notify.provider";
import { ApiError } from "@/types/errors";
import { returnCodeError } from "@/core/helpers/returnCodeError";
import Welcome from "@/components/Content/Welcome";
import { useAuth } from "@/core/providers/auth.provider";
import { AuthVerifyEmailDTO } from "@/features/identity/contracts/auth-verify-email.dto";

const VerifyEmail = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { mutate: verifyEmailApi } = useMutation({
    mutationFn: (data: AuthVerifyEmailDTO) =>
      identityApi.verifyEmail(data),
    onSuccess: () => {
      showNotification(t("auth:emailVerification.messageSuccess"), "success");
      signIn();
    },
    onError: (error: ApiError) => {
      const codeError = returnCodeError(error);
      showNotification(t("auth:emailVerification.error"), "error", codeError);
      router.push("/");
    },
  });

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      verifyEmailApi({ token });
    } else {
      router.push("/");
    }
  }, [searchParams, router, verifyEmailApi]);

  return <Welcome />;
};

export default VerifyEmail;
