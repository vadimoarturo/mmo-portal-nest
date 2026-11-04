"use client";
import { useModal } from "@/core/providers/modal.provider";
import React, { useEffect } from "react";

const Modal = () => {
  const { content, hideModal } = useModal();

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        hideModal();
      }
    };

    if (content) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => document.removeEventListener("keydown", handleEsc);
  }, [content, hideModal]);

  const handleClickOutside = (event: React.MouseEvent<HTMLDivElement>) => {
    if ((event.target as Element).classList.contains("modal-overlay")) {
      hideModal();
    }
  };

  return (
    <>
      {/* Модал */}
      {content && (
        <div
          className={`modal-overlay bg-black bg-opacity-30 fixed inset-0 flex justify-center items-center z-[9999] transition-opacity duration-300 p-5 w-full h-full`}
          onClick={handleClickOutside}
        >
          <div
            className={`bg-black-1 border-[2px] border-gray-1 rounded-lg shadow-lg p-5 relative transition-all duration-300 max-h-screen overflow-y-auto scrollbar-none scrollbar-thumb-gray scrollbar-thumb-rounded-full scrollbar-track-transparent scrollbar-thin mb:w-full mb:max-w-full not-mb:w-auto`}
          >
            <button
              onClick={hideModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition duration-200"
            >
              ✕
            </button>
            <div className="text-gray-300 scrollbar-none scrollbar-thumb-gray scrollbar-thumb-rounded-full scrollbar-track-transparent scrollbar-thin h-full">
              {content}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;
