"use client";

import React from "react";
import styles from "./index.module.css";

interface InputProps {
  id?: string;
  type?: "text" | "email" | "password" | "url" | "tel" | "number";
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  valid?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function Input({
  id,
  type = "text",
  value,
  onChange,
  onKeyDown,
  placeholder,
  disabled = false,
  error = false,
  valid = false,
  className = "",
  style,
}: InputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const inputClasses = [
    styles.input_field,
    error ? styles.error_border : "",
    valid ? styles.valid_border : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.input_container}>
      <input
        id={id}
        type={type}
        value={value}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={inputClasses}
        disabled={disabled}
        style={style}
      />
    </div>
  );
}
