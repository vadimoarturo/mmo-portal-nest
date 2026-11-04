"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
  useCallback,
} from "react";
import { useTranslation } from "react-i18next";
// import { useTranslation } from 'react-i18next';

interface NotificationProps {
  message: string;
  type: "success" | "error";
  errorCode?: string;
}

interface NotificationContextType {
  showNotification: (
    message: string,
    type: "success" | "error",
    errorCode?: string,
    duration?: number,
  ) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification должен быть использован внутри NotificationProvider",
    );
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { t } = useTranslation();
  const durationDefault = 5000;
  const [notification, setNotification] = useState<NotificationProps | null>(
    null,
  );
  const [remainingTime, setRemainingTime] = useState(0);
  const [duration, setDuration] = useState(durationDefault);
  const [progress, setProgress] = useState(100);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const clear = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const showNotification = useCallback(
    (
      message: string,
      type: "success" | "error",
      errorCode?: string,
      duration = durationDefault,
    ) => {
      clear();
      const errorMessage = errorCode
        ? message + " " + t(`errors:code.${errorCode}`)
        : message;
      setNotification({ message: errorMessage, type });
      setRemainingTime(duration / 1000);
      setDuration(duration);
      setProgress(100);

      timeoutRef.current = setTimeout(() => {
        setNotification(null);
      }, duration);
    },
    [clear, t],
  );

  useEffect(() => {
    if (notification) {
      const interval = 100;
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - 100 / (duration / interval);
          return newProgress > 0 ? newProgress : 0;
        });

        setRemainingTime((prev) => (prev > 0 ? prev - 0.1 : 0));
      }, interval);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [notification, duration]);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <div
          onClick={() => setNotification(null)}
          className={`flex cursor-pointer fixed mb:max-w-[343px] max-w-[600px] w-full mb:h-[55px] h-[64px] z-[9999] bottom-4 left-1/2 transform -translate-x-1/2 rounded-[16px] items-center justify-center ${notification.type === "success" ? "bg-green-1" : "bg-red"}`}
        >
          <div className="flex flex-row items-center w-full p-4">
            <div className="flex justify-between items-center w-full p-4">
              <p
                className={`p1 mb:p2 ${notification.type === "success" ? "text-black" : "text-white"}`}
              >
                {notification.message}
              </p>
              <div className="relative flex items-center justify-center">
                <svg
                  className={`w-[40px] h-[40px] mb:w-[35px] mb:h-[35px] ${notification.type === "success" ? "stroke-black" : "stroke-white"}`}
                  viewBox="0 0 36 36"
                >
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    strokeWidth="2"
                    strokeDasharray="100"
                    strokeDashoffset={progress - 100}
                    strokeLinecap="round"
                    style={{
                      transition: "stroke-dashoffset 0.1s linear",
                      transform: "rotate(-90deg)",
                      transformOrigin: "50% 50%",
                    }}
                  />
                </svg>
                <p
                  className={`absolute ${notification.type === "success" ? "text-black" : "text-white"} mb:p2 p1`}
                >
                  {Math.ceil(remainingTime)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};
