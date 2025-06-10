import React from "react";

interface InputProps {
  type: "text" | "email" | "password";
  placeholder: string;
  value: string | number | undefined;
  onChange: (value: string) => void;
}

const InputBox: React.FC<InputProps> = ({
  type,
  placeholder,
  value,
  onChange,
}) => {
  return (
    <input
      className="w-full ring-0 outline-none rounded-md border border-gray-500 px-2 py-1 font-main text-gray-600"
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export default InputBox;
