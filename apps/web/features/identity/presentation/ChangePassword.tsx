"use client";
import { identityApi } from "@/features/identity/infrastructure/api";


import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useNotification } from "@/core/providers/notify.provider";
import { useAuth } from "@/core/providers/auth.provider";
import { useModal } from "@/core/providers/modal.provider";
import { ApiError } from "@/types/errors";
import { returnCodeError } from "@/core/helpers/returnCodeError";
import { AuthChangePasswordVerifyDTO } from "@/features/identity/contracts";
import { Input } from "@/components/UI/Input";
import { Button } from "@/components/UI/Button";
import { validateRegexp } from "@/core/helpers/validateRegexp";

const ChangePassword = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const { signIn } = useAuth();
  const { hideModal } = useModal();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mainPassword, setMainPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [key, setKey] = useState(0);
  const [showError, setShowError] = useState(false);

  const { mutate: changePasswordApi, isPending } = useMutation({
    mutationFn: (data: AuthChangePasswordVerifyDTO) =>
      identityApi.verifyChangePassword(data),
    onSuccess: () => {
      showNotification(t("auth:changePassword.success"), "success");
      signIn();
      hideModal();
      setTimeout(() => {
        router.push("/");
      }, 2000);
    },
    onError: (error: ApiError) => {
      const codeError = returnCodeError(error);
      showNotification(t("auth:changePassword.error"), "error", codeError);
    },
  });

  const handleMainPasswordChange = (value: string) => {
    setMainPassword(value);
    setPassword("");
    setConfirmPassword("");
    setShowError(false);
    setKey((prev) => prev + 1);
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    setShowError(true);

    if (value === mainPassword) {
      setPassword(value);
      return true;
    }
    setPassword("");
    return false;
  };

  const handleSubmit = () => {
    if (password) {
      changePasswordApi({ password, token });
    }
  };

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      hideModal();
      router.push("/");
    } else {
      setToken(token);
    }
  }, [searchParams, hideModal, router]);

  const isDisabled = !password || isPending;

  return (
    <div className="flex flex-col gap-5 not-mb:w-[500px] w-full h-full p-10 mb:p-5 items-center">
      <h4 className="text-white text-center">
        {t("auth:changePassword.title")}
      </h4>

      <Input
        hidden={true}
        validateRegex={validateRegexp.passwordSignUp}
        error={t("errors:password", { min: 8 })}
        title={t("input:password.title")}
        placeholder={t("input:password.placeholder")}
        onChange={handleMainPasswordChange}
      />

      <Input
        key={key}
        hidden={true}
        value={confirmPassword}
        error={
          showError && confirmPassword !== mainPassword
            ? t("errors:passwordConfirm")
            : ""
        }
        title={t("input:confirmPassword.title")}
        placeholder={t("input:confirmPassword.placeholder")}
        onChange={handleConfirmPasswordChange}
      />

      <Button
        onClick={handleSubmit}
        isDisabled={isDisabled}
        showLoader={isPending}
      >
        {t("auth:changePassword.submit")}
      </Button>
    </div>
  );
};

export default ChangePassword;
