import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from '@/contexts/AppContext'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Google Docs Converter",
  description: "Convert Google Docs to Markdown and publish to Storyblok",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
