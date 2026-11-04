import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface IProps {
  onChange: (value: string) => void;
  readonly placeholder: string;
  readonly title?: string;
  readonly error?: string;
  readonly errorDescription?: string;
  readonly value?: string;
  readonly validateRegex?: string;
  readonly hidden?: boolean;
  readonly validateFunction?: (value: string) => boolean; // Добавлено validateFunction
}

export const Input = ({
  onChange,
  placeholder,
  title,
  error,
  value,
  validateRegex,
  errorDescription,
  hidden = false,
  validateFunction,
}: IProps) => {
  // const { showPopUpContent } = usePopUpContent();
  const { t } = useTranslation();
  const [getError, setError] = useState<string | undefined>(undefined);
  const [getValue, setValue] = useState<string>(value || "");
  const isError = getError && getValue;
  const [isHidden, setIsHidden] = useState<boolean>(hidden);

  useEffect(() => {
    if (error) {
      setError(error);
    }
  }, [error]);

  useEffect(() => {
    setIsHidden(hidden);
  }, [hidden]);

  useEffect(() => {
    if (value !== undefined) setValue(value);
  }, [value]);

  const validate = (value: string) => {
    setValue(value);
    let isValid = true;

    if (validateRegex) {
      const regex = new RegExp(validateRegex);
      isValid = regex.test(value);
    }

    if (validateFunction) {
      isValid = validateFunction(value) && isValid;
    }

    if (!isValid) {
      setError(errorDescription ? t("input:error_description.title") : error);
      onChange("");
    } else {
      setError(undefined);
      onChange(value);
    }
    return true;
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <p className={`text-gray text-left p2 `}>{title}</p>
      <div
        className={`${isError ? "border-red" : "border-transparent focus-within:border-gray-1"} bg-black-2 border-[1px] flex flex-row gap-2 justify-center items-center p-1 pl-2 ${hidden ? "pr-2" : ""} rounded-[8px]`}
      >
        <input
          type={isHidden ? "password" : "text"}
          value={getValue}
          onChange={(event) => validate(event.target.value)}
          className="p2 w-full h-[30px] border-none outline-none bg-transparent text-white text-left"
          aria-label="Input"
          placeholder={placeholder}
        />
        {hidden && (
          <div
            className={`cursor-pointer ${!isHidden ? "bg-gray-20" : "bg-transparent"} rounded-[6px] p-2`}
            onClick={() => setIsHidden(!isHidden)}
          >
            <svg
              className="cursor-pointer"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <ellipse
                cx="10"
                cy="10"
                rx="7"
                ry="4"
                stroke={isHidden ? "#A0A0A0" : "#FFFFFF"}
                strokeWidth="1.5"
                fill="none"
              />
              <circle
                cx="10"
                cy="10"
                r="2"
                fill={isHidden ? "#A0A0A0" : "#FFFFFF"}
              />
            </svg>
          </div>
        )}
      </div>
      {isError && (
        <div className="flex flex-row gap-1 items-center justify-end">
          <p className="text-red text-right p1 uppercase">{getError}</p>
          {errorDescription && (
            <p className="text-red text-right p1 uppercase">
              {errorDescription}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
