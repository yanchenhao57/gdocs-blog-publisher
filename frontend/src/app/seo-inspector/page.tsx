import React from "react";
import { Metadata } from "next";
import SeoInspectorClient from "./SeoInspectorClient";

export const metadata: Metadata = {
  title: "SEO Content Inspector | Search Engine Visibility Analyzer",
  description:
    "Analyze what search engines see vs. what users see. Compare initial HTML with rendered content to identify SEO risks and optimization opportunities.",
  keywords:
    "SEO audit, content visibility, Googlebot, JavaScript rendering, initial HTML, SEO optimization",
  openGraph: {
    title: "SEO Content Inspector",
    description: "Audit what search engines see on your website",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Content Inspector",
    description: "Audit what search engines see on your website",
  },
};

export default function SeoInspector() {
  return <SeoInspectorClient />;
}

