"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

interface ModalContextProps {
  content: ReactNode | null;
  isVisible: boolean;
  showModal: (content: ReactNode) => void;
  hideModal: () => void;
}

const ModalContext = createContext<ModalContextProps | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [content, setContent] = useState<ReactNode | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const showModal = useCallback((content: ReactNode) => {
    setContent(content);
    setIsVisible(true);
  }, []);

  const hideModal = useCallback(() => {
    setContent(null);
    setIsVisible(false);
  }, []);

  return (
    <ModalContext.Provider value={{ content, isVisible, showModal, hideModal }}>
      {children}
    </ModalContext.Provider>
  );
};
