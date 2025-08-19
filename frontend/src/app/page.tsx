"use client";

import SocketEventsLog from "@/components/socket-events-log";
import DocInput from "../components/DocInput";
import ConversionMonitor from "../components/ConversionMonitor";
import { apiService } from "../services/api";
import { ToastUtils } from "../utils/toastUtils";
import { useState, useEffect } from "react";
import documentSocketService from "../services/documentSocket";

export default function Home() {
  const [currentDocId, setCurrentDocId] = useState<string>("");

  useEffect(() => {
    // 确保Socket服务正常运行
    documentSocketService.getConnectionStats();
  }, []);

  const handleConvert = async (docId: string) => {
    console.log("Converting document:", docId);
    
    // 设置当前正在转换的文档ID，用于过滤Socket事件
    setCurrentDocId(docId);

    try {
      console.log("🚀 开始调用convert接口...");
      
      // 显示开始转换的toast
      ToastUtils.info("🚀 Document Conversion Started", {
        description: `Starting conversion process for document: ${docId}`,
        duration: 3000,
      });
      
      const result = await apiService.convertDocument(docId);

      // 打印完整的响应对象
      console.log("📋 完整响应对象:", result);
    } catch (error) {
      // Use the centralized error handling utility
      ToastUtils.handleError(error, "Document conversion failed");
    } finally {
      // 清除当前文档ID
      setCurrentDocId("");
    }
  };

  return (
    <main style={{ width: "100vw", height: "100vh", margin: 0, padding: 0 }}>
      {/* Socket监听器 - 监听当前文档的转换事件 */}
      <ConversionMonitor docId={currentDocId} />
      
      <DocInput onConvert={handleConvert} />
      {/* <SocketEventsLog /> */}
    </main>
  );
}
