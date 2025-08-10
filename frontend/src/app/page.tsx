"use client";

import SocketEventsLog from "@/components/socket-events-log";
import DocInput from "../components/DocInput";
import { apiService } from "../services/api";

export default function Home() {
  const handleConvert = async (docId: string) => {
    console.log("Converting document:", docId);

    try {
      console.log("🚀 开始调用convert接口...");
      const result = await apiService.convertDocument(docId);

      console.log("✅ Convert接口调用成功！结果如下：");
      console.log("📄 HTML:", result.html);
      console.log("📝 Markdown:", result.markdown);
      console.log("🎨 Richtext:", result.richtext);
      console.log("🤖 AI Meta:", result.aiMeta);
      console.log("📌 第一个H1标题:", result.firstH1Title);
      console.log("🖼️ 封面图片:", result.coverImage);

      // 打印完整的响应对象
      console.log("📋 完整响应对象:", result);

    } catch (error) {
      console.error("❌ Convert接口调用失败:", error);
    }
  };

  return (
    <main style={{ width: "100vw", height: "100vh", margin: 0, padding: 0 }}>
      <DocInput onConvert={handleConvert} />
      <SocketEventsLog />
    </main>
  );
}
