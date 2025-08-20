"use client";

import React, { useState } from "react";
import ImagePreview from "./index";

const ImagePreviewExample: React.FC = () => {
  const [imageUrl, setImageUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(undefined);

  const handleImageLoad = (naturalWidth: number, naturalHeight: number) => {
    console.log("Image loaded:", { naturalWidth, naturalHeight });
  };

  const aspectRatioOptions = [
    { label: "Original Ratio", value: undefined },
    { label: "16:9", value: 16 / 9 },
    { label: "4:3", value: 4 / 3 },
    { label: "1:1", value: 1 },
    { label: "3:2", value: 3 / 2 },
  ];

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "30px", textAlign: "center" }}>
        Image Preview Component Demo
      </h2>

      {/* Configuration Options */}
      <div style={{ 
        marginBottom: "30px", 
        padding: "20px", 
        backgroundColor: "#f9fafb", 
        borderRadius: "8px" 
      }}>
        <h3 style={{ marginTop: 0, marginBottom: "16px" }}>Configuration Options</h3>
        
        <div style={{ marginBottom: "16px" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "8px", 
            fontWeight: "500",
            fontSize: "14px"
          }}>
            Aspect Ratio:
          </label>
          <select
            value={aspectRatio || ""}
            onChange={(e) => {
              const value = e.target.value;
              setAspectRatio(value ? parseFloat(value) : undefined);
            }}
            style={{
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          >
            {aspectRatioOptions.map((option, index) => (
              <option key={index} value={option.value || ""}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 图片预览组件 */}
      <ImagePreview
        imageUrl={imageUrl}
        altText={altText}
        aspectRatio={aspectRatio}
        maxWidth={600}
        maxHeight={400}
        minWidth={300}
        minHeight={200}
        onImageUrlChange={setImageUrl}
        onAltTextChange={setAltText}
        onImageLoad={handleImageLoad}
      />

      {/* Current Status */}
      <div style={{ 
        marginTop: "30px", 
        padding: "20px", 
        backgroundColor: "#f3f4f6", 
        borderRadius: "8px" 
      }}>
        <h3 style={{ marginTop: 0, marginBottom: "16px" }}>Current Status</h3>
        <div style={{ fontSize: "14px", lineHeight: "1.6" }}>
          <p><strong>Image URL:</strong> {imageUrl || "Not set"}</p>
          <p><strong>Alt Text:</strong> {altText || "Not set"}</p>
          <p><strong>Display Ratio:</strong> {aspectRatio ? aspectRatio.toFixed(2) : "Original ratio"}</p>
        </div>
      </div>

      {/* Test Image URLs */}
      <div style={{ 
        marginTop: "30px", 
        padding: "20px", 
        backgroundColor: "#eff6ff", 
        borderRadius: "8px" 
      }}>
        <h3 style={{ marginTop: 0, marginBottom: "16px" }}>Test Image URLs</h3>
        <div style={{ fontSize: "13px", lineHeight: "1.6" }}>
          <p>You can copy these URLs to test the component:</p>
          <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
            <li>https://picsum.photos/800/600</li>
            <li>https://picsum.photos/400/400</li>
            <li>https://picsum.photos/1200/800</li>
            <li>https://via.placeholder.com/600x400</li>
          </ul>
        </div>
      </div>

      {/* Component Features */}
      <div style={{ 
        marginTop: "30px", 
        padding: "20px", 
        backgroundColor: "#f0fdf4", 
        borderRadius: "8px" 
      }}>
        <h3 style={{ marginTop: 0, marginBottom: "16px" }}>Component Features</h3>
        <ul style={{ fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
          <li>✅ Support custom aspect ratio or use original ratio</li>
          <li>✅ Configurable max/min width and height limits</li>
          <li>✅ Loading and error state indicators</li>
          <li>✅ URL input and Alt text editing</li>
          <li>✅ Display original image dimensions</li>
          <li>✅ Responsive design and dark mode support</li>
          <li>✅ High contrast mode support</li>
          <li>✅ Accessibility optimized</li>
        </ul>
      </div>
    </div>
  );
};

export default ImagePreviewExample;