"use client";

import DocInput from "../components/DocInput";

export default function Home() {
  const handleConvert = (docId: string) => {
    console.log("Converting document:", docId);
    // TODO: 实现转换逻辑
  };

  return (
    <main style={{ width: "100vw", height: "100vh", margin: 0, padding: 0 }}>
      <DocInput onConvert={handleConvert} />
    </main>
  );
}
