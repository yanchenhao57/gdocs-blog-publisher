"use client";

import React, { useState } from "react";
import Tab, { TabItem } from "./index";

// 音乐图标组件
const MusicIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
  </svg>
);

// 电影图标组件
const MoviesIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
  </svg>
);

// App图标组件
const AppIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 6h2v2H4zm0 5h2v2H4zm0 5h2v2H4zm16-8V6H8.023v2H18.8zM8 11h12v2H8zm0 5h12v2H8z"/>
  </svg>
);

const TabExample: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("movies");

  const tabItems: TabItem[] = [
    {
      id: "music",
      label: "Music",
      icon: <MusicIcon />,
    },
    {
      id: "movies",
      label: "Movies",
      icon: <MoviesIcon />,
    },
    {
      id: "app",
      label: "App",
      icon: <AppIcon />,
    },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    console.log("Active tab:", tabId);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "music":
        return <div style={{ padding: "20px" }}>Music content here</div>;
      case "movies":
        return <div style={{ padding: "20px" }}>Movies content here</div>;
      case "app":
        return <div style={{ padding: "20px" }}>App content here</div>;
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Tab Component Demo</h2>
      
      <Tab
        items={tabItems}
        defaultActiveId="movies"
        onChange={handleTabChange}
      />
      
      {renderContent()}
    </div>
  );
};

export default TabExample;