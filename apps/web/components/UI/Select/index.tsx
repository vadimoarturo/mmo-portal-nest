import React, { useState, useEffect } from "react";

type TSelectProps = React.DetailedHTMLProps<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  HTMLSelectElement
>;

interface SelectProps extends TSelectProps {
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  className?: string;
  autoSelectFirst?: boolean; // Флаг для автоматического выбора первого элемента
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void; // Обработчик onChange
  label?: string; // Новый проп для передачи label
  labelClassName?: string; // Проп для кастомизации стиля label
}

const Select = ({
  options,
  placeholder,
  className,
  autoSelectFirst = true,
  onChange,
  label,
  labelClassName,
  ...props
}: SelectProps) => {
  const [selectedValue, setSelectedValue] = useState("");

  useEffect(() => {
    // Если флаг включен и значение не установлено, выбираем первый элемент
    if (autoSelectFirst && options.length > 0) {
      const firstValue = options[0].value;
      setSelectedValue(firstValue);

      if (onChange) {
        const event = {
          target: { value: firstValue },
        } as React.ChangeEvent<HTMLSelectElement>;
        onChange(event);
      }
    }
  }, [autoSelectFirst, options, onChange]);

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label className={`mb-2 text-white font-semibold ${labelClassName}`}>
          {label}
        </label>
      )}{" "}
      {/* Добавляем label */}
      <select
        {...props}
        value={selectedValue}
        onChange={(e) => {
          setSelectedValue(e.target.value);
          if (onChange) {
            onChange(e);
          }
        }}
        className={`
          bg-gradient-to-b from-black to-gray-800 text-gray-300
          border-2 border-gray-600
          hover:bg-gradient-to-b hover:from-gray-900 hover:to-black
          font-bold py-2 px-4 rounded-lg
          shadow-md hover:shadow-gray-500/50 transition-all duration-300
          tracking-widest uppercase
          font-mono
        `}
      >
        {placeholder && !autoSelectFirst && (
          <option value="" disabled className="bg-gray-800  text-gray-300">
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-gray-800  text-gray-300"
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
