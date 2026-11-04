"use client";
import Welcome from "@/components/Content/Welcome";
import { Auth } from "@/features/identity/presentation/Auth";
import { useModal } from "@/core/providers/modal.provider";
import { useEffect } from "react";

export default function AuthSignInPage() {
  const { showModal } = useModal();

  useEffect(() => {
    showModal(<Auth typeInitial="SIGN_IN" />);
  }, [showModal]);
  return (
    <>
      <Welcome />
    </>
  );
}
