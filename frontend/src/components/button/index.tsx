"use client";

import React from "react";
import styles from "./index.module.css";

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "size"> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "small" | "medium" | "large";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  children,
  className,
  onClick,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) return;
    onClick?.(e);
  };

  const buttonClasses = [
    styles.button,
    styles[`button_${variant}`],
    styles[`button_${size}`],
    loading && styles.button_loading,
    disabled && styles.button_disabled,
    fullWidth && styles.button_fullwidth,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {loading ? (
        <div className={styles.loading_content}>
          <div className={styles.spinner} />
        </div>
      ) : (
        <div className={styles.button_content}>
          {icon && iconPosition === "left" && (
            <span className={styles.icon_left}>{icon}</span>
          )}
          <span className={styles.button_text}>{children}</span>
          {icon && iconPosition === "right" && (
            <span className={styles.icon_right}>{icon}</span>
          )}
        </div>
      )}
    </button>
  );
};

export default Button;
