/**
 * 语言检测功能测试
 * 测试AI语言检测和用户指定语言功能
 */

import { detectLanguage, detectLanguageWithAI, generateAiStructuredData } from './utils/convertAiStructuredData.js';

// 模拟Socket.io实例
const mockIo = {
  emit: (event, data) => {
    console.log(`[Socket] ${event}:`, data);
  }
};

// 测试数据
const testCases = [
  {
    name: "英文文档",
    markdown: `# Web Development Guide

This is a comprehensive guide to web development. It covers HTML, CSS, and JavaScript fundamentals.

## Getting Started

To begin web development, you need to understand the basics of HTML structure.`,
    expectedLanguage: "en"
  },
  {
    name: "日文文档",
    markdown: `# ウェブ開発ガイド

これはウェブ開発の包括的なガイドです。HTML、CSS、JavaScriptの基礎をカバーしています。

## 始め方

ウェブ開発を始めるには、HTML構造の基本を理解する必要があります。`,
    expectedLanguage: "jp"
  },
  {
    name: "混合语言文档",
    markdown: `# プログラミング入門 Programming Introduction

このガイドでは、プログラミングの基本概念を説明します。
This guide explains the basic concepts of programming.

## 変数 Variables

変数はデータを格納するために使用されます。
Variables are used to store data.`,
    expectedLanguage: "jp" // 应该检测为主要语言
  }
];

// 测试传统语言检测
console.log("=== 测试传统语言检测方法 ===");
testCases.forEach(testCase => {
  const detected = detectLanguage(testCase.markdown);
  console.log(`${testCase.name}: 检测到 ${detected}, 期望 ${testCase.expectedLanguage}`);
});

// 测试AI语言检测（需要实际的AI服务）
console.log("\n=== 测试AI语言检测方法 ===");
async function testAILanguageDetection() {
  for (const testCase of testCases) {
    try {
      const detected = await detectLanguageWithAI(testCase.markdown);
      console.log(`${testCase.name}: AI检测到 ${detected}, 期望 ${testCase.expectedLanguage}`);
    } catch (error) {
      console.log(`${testCase.name}: AI检测失败 - ${error.message}`);
    }
  }
}

// 测试用户指定语言功能
console.log("\n=== 测试用户指定语言功能 ===");
async function testUserLanguageOverride() {
  const testMarkdown = testCases[0].markdown; // 使用英文文档
  
  try {
    // 测试用户指定日文
    const resultWithJP = await generateAiStructuredData(
      testMarkdown, 
      mockIo, 
      "test-doc-id", 
      "test", 
      "jp" // 用户指定日文
    );
    console.log("用户指定日文结果:", resultWithJP.language);
    
    // 测试用户指定英文
    const resultWithEN = await generateAiStructuredData(
      testMarkdown, 
      mockIo, 
      "test-doc-id", 
      "test", 
      "en" // 用户指定英文
    );
    console.log("用户指定英文结果:", resultWithEN.language);
    
  } catch (error) {
    console.log("测试失败:", error.message);
  }
}

// 运行测试
async function runTests() {
  await testAILanguageDetection();
  await testUserLanguageOverride();
}

// 如果直接运行此文件，执行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { testCases, testAILanguageDetection, testUserLanguageOverride }; 