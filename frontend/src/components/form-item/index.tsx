"use client";

import React from "react";
import styles from "./index.module.css";

interface FormItemProps {
  label?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function FormItem({
  label,
  required = false,
  children,
  className = "",
}: FormItemProps) {
  return (
    <div className={`${styles.form_item} ${className}`}>
      {label && (
        <div className={styles.label_wrapper}>
          <label className={styles.label}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
        </div>
      )}
      <div className={styles.input_part}>
        {children}
      </div>
    </div>
  );
}
