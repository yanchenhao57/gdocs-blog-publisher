"use client";

import React, { ReactNode } from "react";
import { SocketProvider } from "./SocketContext";

// Provider组件
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <SocketProvider autoConnect={true}>
      {children}
    </SocketProvider>
  );
}; 