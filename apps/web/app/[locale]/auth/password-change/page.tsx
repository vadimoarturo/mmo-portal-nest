"use client";

import ChangePassword from "@/components/UI/Modal/Content/ChangePassword";
import Welcome from "@/components/Content/Welcome";
import { useModal } from "@/core/providers/modal.provider";
import { useEffect } from "react";

const ChangePasswordPage = () => {
  const { showModal } = useModal();

  useEffect(() => {
    showModal(<ChangePassword />);
  }, [showModal]);

  return <Welcome />;
};

export default ChangePasswordPage;
