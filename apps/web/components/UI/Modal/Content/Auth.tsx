"use client";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "../../Input";
import { validateRegexp } from "@/core/helpers/validateRegexp";
import { Button } from "../../Button";
import { useMutation } from "@tanstack/react-query";
import {
  AuthChangePasswordDTO,
  AuthSignInDTO,
  AuthSignUpDTO,
} from "@/types/dto/auth";
import { BackendApiService } from "@/core/services/api";
import { useNotification } from "@/core/providers/notify.provider";
import { useAuth } from "@/core/providers/auth.provider";
import { ApiError } from "@/types/errors";
import { returnCodeError } from "@/core/helpers/returnCodeError";
import Download from "./Download";
import { useModal } from "@/core/providers/modal.provider";

export type AuthTypes = "SIGN_IN" | "SIGN_UP";

interface AuthTypesProps {
  type?: AuthTypes;
  onChange: (selectedType: AuthTypes) => void;
}

const AuthTypes = ({ type, onChange }: AuthTypesProps) => {
  const [selectedType, setSelectedType] = useState<AuthTypes>(
    type || "SIGN_IN",
  );

  const handleSelect = (type: AuthTypes) => {
    setSelectedType(type);
    onChange(type);
  };

  return (
    <div className="flex flex-row w-full bg-black-2 rounded-md ">
      <div className="flex flex-row p-1 w-full items-center justify-center gap-1">
        <ButtonType
          type="SIGN_IN"
          isActive={selectedType === "SIGN_IN"}
          onClick={() => handleSelect("SIGN_IN")}
        />
        <ButtonType
          type="SIGN_UP"
          isActive={selectedType === "SIGN_UP"}
          onClick={() => handleSelect("SIGN_UP")}
        />
      </div>
    </div>
  );
};

interface ButtonTypeProps {
  type: AuthTypes;
  isActive: boolean;
  onClick: () => void;
}

const ButtonType = ({ type, isActive, onClick }: ButtonTypeProps) => {
  const { t } = useTranslation();
  const textStyle = isActive ? "text-black" : "text-white";
  const bgStyle = isActive ? "bg-white" : "bg-black hover:bg-gray";

  return (
    <button
      onClick={onClick}
      className={`${bgStyle} flex flex-row items-center w-full h-[40px] rounded-md`}
    >
      <div className="flex flex-row w-full justify-center items-center">
        <div className="flex flex-row gap-1 items-center p-2">
          <p
            className={`${textStyle} text-center button_small uppercase font-mono truncate mb:max-w-[100px] max-w-full`}
          >
            {t(`auth:types:${type}`)}
          </p>
        </div>
      </div>
    </button>
  );
};

const ForgotPasswordForm = ({
  setEmail,
  setForgotPassword,
}: {
  setEmail: (email: string) => void;
  setForgotPassword: (forgotPassword: boolean) => void;
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 justify-center items-center w-full">
      <h4 className="text-white">{t("button:forgotPassword")}</h4>
      <Input
        validateRegex={validateRegexp.email}
        error={t("errors:email")}
        title={t("input:email.title")}
        placeholder={t("input:email.placeholder")}
        onChange={(value) => setEmail(value)}
      />
      <p
        onClick={() => setForgotPassword(false)}
        className="text-gray p1 cursor-pointer hover:text-white"
      >
        {t("button:back")}
      </p>
    </div>
  );
};
const SignInForm = ({
  forgotPassword,
  setEmail,
  setLogin,
  setPassword,
  setForgotPassword,
}: {
  forgotPassword: boolean;
  setEmail: (email: string) => void;
  setLogin: (login: string) => void;
  setPassword: (password: string) => void;
  setForgotPassword: (forgotPassword: boolean) => void;
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 justify-center items-center w-full">
      {forgotPassword && (
        <ForgotPasswordForm
          setEmail={setEmail}
          setForgotPassword={setForgotPassword}
        />
      )}
      {!forgotPassword && (
        <>
          <h4 className="text-white">{t("button:signIn")}</h4>
          <Input
            title={t("input:login.title")}
            placeholder={t("input:login.placeholder")}
            onChange={(value) => setLogin(value)}
          />
          <Input
            hidden={true}
            validateRegex={validateRegexp.passwordSignIn}
            title={t("input:password.title")}
            placeholder={t("input:password.placeholder")}
            onChange={(value) => setPassword(value)}
          />
          <p
            onClick={() => setForgotPassword(true)}
            className="text-gray p1 cursor-pointer hover:text-white"
          >
            {t("button:forgotPassword")}
          </p>
        </>
      )}
    </div>
  );
};

const SignUpForm = ({
  setEmail,
  setLogin,
  setPassword,
}: {
  setEmail: (email: string) => void;
  setLogin: (login: string) => void;
  setPassword: (password: string) => void;
}) => {
  const { t } = useTranslation();
  const [mainPassword, setMainPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [key, setKey] = useState(0);
  const [showError, setShowError] = useState(false);

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

  return (
    <div className="flex flex-col gap-4 justify-center items-center w-full">
      <h4 className="text-white">{t("button:signUp")}</h4>
      <Input
        validateRegex={validateRegexp.email}
        error={t("errors:email")}
        title={t("input:email.title")}
        placeholder={t("input:email.placeholder")}
        onChange={(value) => setEmail(value)}
      />
      <Input
        validateRegex={validateRegexp.login}
        error={t("errors:login", { min: 4, max: 15 })}
        title={t("input:login.title")}
        placeholder={t("input:login.placeholder")}
        onChange={(value) => setLogin(value)}
      />
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
        validateFunction={handleConfirmPasswordChange}
      />
    </div>
  );
};

export const Auth = ({ typeInitial }: { typeInitial: AuthTypes }) => {
  const { showNotification } = useNotification();
  const { signIn } = useAuth();
  const { showModal } = useModal();
  const { t } = useTranslation();
  const { mutate: signInApi } = useMutation({
    mutationKey: ["signIn"],
    mutationFn: (data: AuthSignInDTO) => BackendApiService.signIn(data),
    onSuccess: () => {
      signIn();
    },
    onError: (error: ApiError) => {
      const codeError = returnCodeError(error);
      showNotification(t("errors:error.auth.signIn"), "error", codeError);
    },
  });

  const { mutate: signUpApi } = useMutation({
    mutationKey: ["signUp"],
    mutationFn: (data: AuthSignUpDTO) => BackendApiService.signUp(data),
    onSuccess: () => {
      showNotification(t("auth:emailVerification.emailSent"), "success");
      signIn();
      showModal(<Download />);
    },
    onError: (error: ApiError) => {
      const codeError = returnCodeError(error);
      showNotification(t("errors:error.auth.signUp"), "error", codeError);
    },
  });

  const { mutate: changePasswordApi } = useMutation({
    mutationKey: ["changePassword"],
    mutationFn: (data: AuthChangePasswordDTO) =>
      BackendApiService.changePassword(data),
    onSuccess: () => {
      showNotification(t("auth:forgotPassword.emailSent"), "success");
      signIn();
    },
    onError: (error: ApiError) => {
      const codeError = returnCodeError(error);
      showNotification(t("auth:forgotPassword.emailError"), "error", codeError);
    },
  });

  const [type, setType] = useState<AuthTypes>(typeInitial || "SIGN_IN");
  const [email, setEmail] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [forgotPassword, setForgotPassword] = useState(false);
  let isDisabled = false;
  if (forgotPassword) {
    isDisabled = !email;
  } else if (type === "SIGN_IN") {
    isDisabled = !login || !password;
  } else if (type === "SIGN_UP") {
    isDisabled = !email || !login || !password;
  }

  useEffect(() => {
    if (type === "SIGN_UP") {
      setForgotPassword(false);
    }
  }, [type]);

  return (
    <>
      <div className="flex flex-col gap-5 not-mb:w-[500px] w-full h-full p-10 mb:p-5 items-center">
        <AuthTypes type={type} onChange={(type) => setType(type)} />
        {type === "SIGN_IN" && (
          <SignInForm
            forgotPassword={forgotPassword}
            setEmail={setEmail}
            setLogin={setLogin}
            setPassword={setPassword}
            setForgotPassword={setForgotPassword}
          />
        )}
        {type === "SIGN_UP" && (
          <SignUpForm
            setEmail={setEmail}
            setLogin={setLogin}
            setPassword={setPassword}
          />
        )}
        <Button
          onClick={() => {
            if (forgotPassword) {
              changePasswordApi({ email });
            } else {
              if (type === "SIGN_IN") {
                signInApi({ login, password });
              } else if (type === "SIGN_UP") {
                signUpApi({ email, login, password });
              }
            }
          }}
          isDisabled={isDisabled}
        >
          {t("button:continue")}
        </Button>

        <Button onClick={() => showModal(<Download />)} theme="green">
          {t("button:downloadClient")}
        </Button>
      </div>
    </>
  );
};
