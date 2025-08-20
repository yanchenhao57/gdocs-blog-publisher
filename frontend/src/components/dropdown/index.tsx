"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronUp, Check } from "lucide-react";
import styles from "./index.module.css";

export interface DropdownOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  onChange?: (value: string, option: DropdownOption) => void;
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  defaultValue,
  placeholder = "Select an option",
  searchable = true,
  disabled = false,
  onChange,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(
    value || defaultValue || ""
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [openUpward, setOpenUpward] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.id === selectedValue);

  // 过滤选项基于搜索查询
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 处理点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 当下拉菜单打开时自动聚焦搜索框和检测位置
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }

    if (isOpen && dropdownRef.current) {
      checkDropdownPosition();
    }
  }, [isOpen, searchable]);

  // 检测下拉菜单位置
  const checkDropdownPosition = () => {
    if (!dropdownRef.current) return;

    const rect = dropdownRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    // 估算菜单高度 (搜索框 + 最多6个选项 + 边距)
    const estimatedMenuHeight =
      (searchable ? 50 : 0) + Math.min(filteredOptions.length, 6) * 48 + 16;

    // 如果下方空间不足且上方空间更充足，则向上展开
    setOpenUpward(spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow);
  };

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    setSearchQuery("");
  };

  const handleOptionSelect = (option: DropdownOption) => {
    if (option.disabled) return;

    setSelectedValue(option.id);
    setIsOpen(false);
    setSearchQuery("");
    onChange?.(option.id, option);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div
      ref={dropdownRef}
      className={`${styles.dropdown_container} ${className || ""} ${
        disabled ? styles.disabled : ""
      }`}
    >
      {/* 触发按钮 */}
      <button
        type="button"
        className={`${styles.dropdown_trigger} ${isOpen ? styles.open : ""}`}
        onClick={handleToggle}
        disabled={disabled}
      >
        <div className={styles.trigger_content}>
          {selectedOption ? (
            <>
              {selectedOption.icon && (
                <span className={styles.trigger_icon}>
                  {selectedOption.icon}
                </span>
              )}
              <span className={styles.trigger_label}>
                {selectedOption.label}
              </span>
            </>
          ) : (
            <span className={styles.trigger_placeholder}>{placeholder}</span>
          )}
        </div>
        <ChevronUp
          size={16}
          className={`${styles.chevron} ${isOpen ? styles.chevron_open : ""}`}
        />
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div
          ref={menuRef}
          className={`${styles.dropdown_menu} ${
            openUpward ? styles.dropdown_menu_upward : ""
          }`}
        >
          {/* 搜索框 */}
          {searchable && (
            <div className={styles.search_container}>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search..."
                className={styles.search_input}
              />
            </div>
          )}

          {/* 选项列表 */}
          <div className={styles.options_container}>
            {filteredOptions.length === 0 ? (
              <div className={styles.no_options}>No options found</div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`${styles.option} ${
                    option.id === selectedValue ? styles.option_selected : ""
                  } ${option.disabled ? styles.option_disabled : ""}`}
                  onClick={() => handleOptionSelect(option)}
                  disabled={option.disabled}
                >
                  <div className={styles.option_content}>
                    {option.icon && (
                      <span className={styles.option_icon}>{option.icon}</span>
                    )}
                    <span className={styles.option_label}>{option.label}</span>
                  </div>
                  {option.id === selectedValue && (
                    <Check size={16} className={styles.check_icon} />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
