"use client";

import React, { useState, useEffect } from "react";
import styles from "./index.module.css";

export interface NumberStepperProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

const NumberStepper: React.FC<NumberStepperProps> = ({
  value,
  defaultValue = 3,
  min = 0,
  max = 99,
  step = 1,
  onChange,
  disabled = false,
  className,
}) => {
  const [currentValue, setCurrentValue] = useState(value ?? defaultValue);

  useEffect(() => {
    if (value !== undefined) {
      setCurrentValue(value);
    }
  }, [value]);

  const handleDecrement = () => {
    if (disabled || currentValue <= min) return;
    const newValue = Math.max(currentValue - step, min);
    setCurrentValue(newValue);
    onChange?.(newValue);
  };

  const handleIncrement = () => {
    if (disabled || currentValue >= max) return;
    const newValue = Math.min(currentValue + step, max);
    setCurrentValue(newValue);
    onChange?.(newValue);
  };

  return (
    <div 
      className={`${styles.stepper_container} ${className || ""} ${disabled ? styles.disabled : ""}`}
    >
      {/* 减号按钮 */}
      <button
        type="button"
        className={`${styles.stepper_button} ${styles.decrement_button}`}
        onClick={handleDecrement}
        disabled={disabled || currentValue <= min}
      >
        <span className={styles.button_icon}>−</span>
      </button>

      {/* 数字显示区域 */}
      <div className={styles.number_display}>
        <span className={styles.number_value}>{currentValue}</span>
      </div>

      {/* 加号按钮 */}
      <button
        type="button"
        className={`${styles.stepper_button} ${styles.increment_button}`}
        onClick={handleIncrement}
        disabled={disabled || currentValue >= max}
      >
        <span className={styles.button_icon}>+</span>
      </button>
    </div>
  );
};

export default NumberStepper;