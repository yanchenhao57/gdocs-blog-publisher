import React from "react";
import { Metadata } from "next";
import InternalLinkOptimizerClient from "./InternalLinkOptimizerClient";

export const metadata: Metadata = {
  title: "Internal Link Optimizer | AI-Powered Content Optimization",
  description:
    "Optimize your content with AI-powered internal linking suggestions. Analyze your blog posts and get intelligent recommendations for better SEO and user experience.",
  keywords:
    "internal links, SEO optimization, content optimization, AI suggestions, blog optimization",
  openGraph: {
    title: "Internal Link Optimizer",
    description: "AI-powered internal linking optimization tool",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Internal Link Optimizer",
    description: "AI-powered internal linking optimization tool",
  },
};

export default function InternalLinkOptimizer() {
  return <InternalLinkOptimizerClient />;
}
