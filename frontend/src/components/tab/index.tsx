"use client";

import React, { useState } from "react";
import styles from "./index.module.css";

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface TabProps {
  items: TabItem[];
  defaultActiveId?: string;
  onChange?: (activeId: string) => void;
  className?: string;
}

const Tab: React.FC<TabProps> = ({
  items,
  defaultActiveId,
  onChange,
  className,
}) => {
  const [activeId, setActiveId] = useState(
    defaultActiveId || items[0]?.id || ""
  );

  const handleTabClick = (tabId: string, disabled?: boolean) => {
    if (disabled) return;
    
    setActiveId(tabId);
    onChange?.(tabId);
  };

  return (
    <div className={`${styles.tab_container} ${className || ""}`}>
      {items.map((item) => (
        <button
          key={item.id}
          className={`${styles.tab_item} ${
            activeId === item.id ? styles.tab_item_active : ""
          } ${item.disabled ? styles.tab_item_disabled : ""}`}
          onClick={() => handleTabClick(item.id, item.disabled)}
          disabled={item.disabled}
        >
          {item.icon && (
            <span className={styles.tab_icon}>{item.icon}</span>
          )}
          <span className={styles.tab_label}>{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default Tab;