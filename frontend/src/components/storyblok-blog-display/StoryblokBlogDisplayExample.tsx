"use client";

import React, { useState } from "react";
import StoryblokBlogDisplay from "./index";
import type { IBlogContent } from "../../types/storyblok";

export default function StoryblokBlogDisplayExample() {
  const [fullSlug, setFullSlug] = useState("blog/chatgpt-statistics-2025");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const exampleSlugs = [
    "blog/chatgpt-statistics-2025",
    "blog/ai-trends-2025", 
    "blog/web-development-guide",
    "blog/nextjs-tutorial",
    "blog/react-best-practices"
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Storyblok Blog Display Example
        </h1>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="slug-input" className="block text-sm font-medium text-gray-700 mb-2">
              Full Slug:
            </label>
            <select
              id="slug-input"
              value={fullSlug}
              onChange={(e) => setFullSlug(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {exampleSlugs.map((slug) => (
                <option key={slug} value={slug}>
                  {slug}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-4 text-sm">
            <div className={`px-3 py-1 rounded-full ${loading ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
              Status: {loading ? 'Loading...' : 'Ready'}
            </div>
            {error && (
              <div className="px-3 py-1 rounded-full bg-red-100 text-red-800">
                Error: {error}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Blog Content:</h2>
        
        <StoryblokBlogDisplay
          fullSlug={fullSlug}
          onLoadingChange={setLoading}
          onError={setError}
        />
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Component Features</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>✅ Fetches blog content from Storyblok API</li>
          <li>✅ Renders rich text using @storyblok/richtext</li>
          <li>✅ React-optimized with proper TypeScript support</li>
          <li>✅ Responsive design with modern styling</li>
          <li>✅ Loading states with skeleton placeholders</li>
          <li>✅ Error handling with retry functionality</li>
          <li>✅ Supports cover images and metadata</li>
          <li>✅ JSX attribute conversion (class → className)</li>
        </ul>
      </div>

      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-3">API Integration</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p><strong>Endpoint:</strong> <code>/api/storyblok/story/{fullSlug}</code></p>
          <p><strong>Current Slug:</strong> <code>{fullSlug}</code></p>
          <p><strong>Library:</strong> @storyblok/richtext v3.x</p>
          <p><strong>Documentation:</strong> <a href="https://www.storyblok.com/docs/packages/storyblok-richtext" target="_blank" rel="noopener noreferrer" className="underline">Official Docs</a></p>
        </div>
      </div>
    </div>
  );
}
