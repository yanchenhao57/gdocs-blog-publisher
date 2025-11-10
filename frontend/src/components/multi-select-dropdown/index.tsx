"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronUp, Check, X } from "lucide-react";
import styles from "./index.module.css";

export interface DropdownOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface MultiSelectDropdownProps {
  options: DropdownOption[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  className?: string;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  options,
  value = [],
  onChange,
  placeholder = "Select options",
  searchable = true,
  disabled = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openUpward, setOpenUpward] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOptions = options.filter((option) =>
    value.includes(option.id)
  );

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

  // 检测下拉菜单位置
  const checkDropdownPosition = useCallback(() => {
    if (!dropdownRef.current) return;

    const rect = dropdownRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    const estimatedMenuHeight =
      (searchable ? 50 : 0) + Math.min(filteredOptions.length, 6) * 48 + 16;

    setOpenUpward(spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow);
  }, [searchable, filteredOptions.length]);

  // 当下拉菜单打开时自动聚焦搜索框和检测位置
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }

    if (isOpen && dropdownRef.current) {
      checkDropdownPosition();
    }
  }, [isOpen, searchable, checkDropdownPosition]);

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    setSearchQuery("");
  };

  const handleOptionToggle = (option: DropdownOption) => {
    if (option.disabled) return;

    const newValue = value.includes(option.id)
      ? value.filter((id) => id !== option.id)
      : [...value, option.id];

    onChange(newValue);
  };

  const handleRemoveTag = (
    optionId: string,
    e: React.MouseEvent<HTMLSpanElement> | React.KeyboardEvent<HTMLSpanElement>
  ) => {
    e.stopPropagation();
    const newValue = value.filter((id) => id !== optionId);
    onChange(newValue);
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
        className={`${styles.dropdown_trigger} ${
          isOpen ? styles.open : ""
        } ${styles.multi_select_trigger}`}
        onClick={handleToggle}
        disabled={disabled}
      >
        <div className={styles.trigger_content}>
          {selectedOptions.length > 0 ? (
            <div className={styles.tags_container}>
              {selectedOptions.map((option) => (
                <span key={option.id} className={styles.tag}>
                  <span className={styles.tag_label}>{option.label}</span>
                  <span
                    className={styles.tag_remove}
                    onClick={(e) => handleRemoveTag(option.id, e)}
                    role="button"
                    tabIndex={disabled ? -1 : 0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleRemoveTag(option.id, e);
                      }
                    }}
                    aria-label={`Remove ${option.label}`}
                  >
                    <X size={12} />
                  </span>
                </span>
              ))}
            </div>
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
              filteredOptions.map((option) => {
                const isSelected = value.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={`${styles.option} ${
                      isSelected ? styles.option_selected : ""
                    } ${option.disabled ? styles.option_disabled : ""}`}
                    onClick={() => handleOptionToggle(option)}
                    disabled={option.disabled}
                  >
                    <div className={styles.option_content}>
                      {option.icon && (
                        <span className={styles.option_icon}>
                          {option.icon}
                        </span>
                      )}
                      <span className={styles.option_label}>
                        {option.label}
                      </span>
                    </div>
                    {isSelected && (
                      <Check size={16} className={styles.check_icon} />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;

