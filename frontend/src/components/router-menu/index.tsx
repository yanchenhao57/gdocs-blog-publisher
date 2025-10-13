"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, FileText, Link, X } from "lucide-react";
import styles from "./index.module.css";

interface RouteItem {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  path: string;
}

const RouterMenu = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isInitialMount, setIsInitialMount] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);

  const toggleMenu = () => {
    setIsExpanded(!isExpanded);
  };

  // 监听路由变化，自动收起菜单
  useEffect(() => {
    if (prevPathnameRef.current !== pathname && isExpanded) {
      setIsExpanded(false);
    }
    prevPathnameRef.current = pathname;
  }, [pathname, isExpanded]);

  // 首次挂载后禁用初始动画
  useEffect(() => {
    setIsInitialMount(false);
  }, []);

  const routes: RouteItem[] = [
    { icon: FileText, label: "Google Docs Converter", path: "/" },
    {
      icon: Link,
      label: "Internal Link Optimizer",
      path: "/internal-link-optimizer",
    },
  ];

  const handleRouteClick = (path: string) => {
    router.push(path);
    setIsExpanded(false);
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(path);
  };

  return (
    <div className={styles.container}>
      <div
        className={`${styles.menu_wrapper} ${
          isExpanded ? styles.expanded : ""
        }`}
        onClick={!isExpanded ? toggleMenu : undefined}
      >
        {!isExpanded ? (
          <div
            className={`${styles.menu_button} ${
              !isInitialMount ? styles.fade_in_button : ""
            }`}
          >
            <Menu size={18} className={styles.menu_icon} />
            <span className={styles.menu_text}>Menu</span>
          </div>
        ) : (
          <div className={styles.menu_content}>
            <div className={styles.menu_header}>
              <span className={styles.header_title}>NAVIGATION</span>
              <button
                className={styles.close_button}
                onClick={toggleMenu}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
            <div className={styles.menu_list}>
              {routes.map((route, index) => {
                const IconComponent = route.icon;
                return (
                  <div
                    key={index}
                    className={`${styles.menu_item} ${
                      isActive(route.path) ? styles.active : ""
                    }`}
                    onClick={() => handleRouteClick(route.path)}
                  >
                    <div className={styles.menu_item_left}>
                      <IconComponent size={18} className={styles.item_icon} />
                      <span className={styles.item_label}>{route.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouterMenu;
