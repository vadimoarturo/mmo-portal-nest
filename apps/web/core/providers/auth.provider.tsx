"use client";

import { appLink } from "@/components/Content/Header/constants";
import { CookieStore } from "@/types/enum";
import { useMutation } from "@tanstack/react-query";
import { useCookies } from "next-client-cookies";
import { useRouter } from "next/navigation";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { BackendApiService } from "../services/api";
import { useModal } from "./modal.provider";

type AuthContextType = {
  isAuth: boolean;
  getUser: string | undefined;
  isVerifyEmail: boolean;
  signIn: () => void;
  logOut: () => void;
  refreshUser: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const cookieStore = useCookies();
  const { mutate: mutateLogout } = useMutation({
    mutationKey: ["logout"],
    mutationFn: () => BackendApiService.logout(),
  });

  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [getUser, setUser] = useState<string | undefined>(undefined);
  const [isVerifyEmail, setIsVerifyEmail] = useState<boolean>(false);
  const { hideModal } = useModal();

  const refreshUser = useCallback(() => {
    const userCookie = cookieStore.get(CookieStore.login) as string;
    if (userCookie) {
      setIsAuth(true);
      setUser(userCookie);
      router.push(appLink.shop);
    }
    const isVerifyEmailCookie = cookieStore.get(
      CookieStore.isVerifyEmail,
    ) as string;
    if (isVerifyEmailCookie) {
      setIsVerifyEmail(isVerifyEmailCookie === "true" ? true : false);
    }
  }, [cookieStore, router]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const signIn = () => {
    const userCookie = cookieStore.get(CookieStore.login) as string;
    const isVerifyEmailCookie = cookieStore.get(
      CookieStore.isVerifyEmail,
    ) as string;
    if (isVerifyEmailCookie) {
      setIsVerifyEmail(isVerifyEmailCookie === "true" ? true : false);
    }
    if (userCookie) {
      setIsAuth(true);
      setUser(userCookie);
      hideModal();
      router.push(appLink.shop);
    }
  };

  const logOut = () => {
    setIsAuth(false);
    cookieStore.remove(CookieStore.login);
    cookieStore.remove(CookieStore.email);
    cookieStore.remove(CookieStore.isVerifyEmail);
    cookieStore.remove(CookieStore.accessToken);
    cookieStore.remove(CookieStore.isVerifyEmail);
    cookieStore.remove(CookieStore.refreshToken);
    cookieStore.remove(CookieStore.verifyToken);
    mutateLogout();
    router.push(appLink.home);
  };

  return (
    <AuthContext.Provider
      value={{ isAuth, getUser, isVerifyEmail, signIn, logOut, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
