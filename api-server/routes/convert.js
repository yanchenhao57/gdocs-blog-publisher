import express from "express";
import { executeDocumentConversion } from "../../utils/documentConversionPipeline.js";
import { handleAiRegeneration } from "../../utils/aiRegenerationHandler.js";
import { sendSocketNotification } from "../../utils/socketIO.js";

const router = express.Router();

router.post("/", async (req, res) => {
  console.log("🚀 ~ router.post ~ req.body:", req.body);

  // 获取Socket.io实例
  const io = req.app.get("io");

  try {
    const { docId } = req.body;
    if (!docId) return res.status(400).json({ error: "docId is required" });

    // 执行完整的文档转换流程
    const result = await executeDocumentConversion(docId, io);
    
    res.json(result);
  } catch (err) {
    // 通知：转换过程中出现错误
    sendSocketNotification(io, "convert:error", {
      docId: req.body.docId,
      message: "转换过程中出现错误",
      error: err.message,
    });

    res.status(500).json({ error: err.message });
  }
});

// AI重新生成接口
router.post("/regenerate", async (req, res) => {
  console.log("🔄 ~ router.post /regenerate ~ req.body:", req.body);

  // 获取Socket.io实例
  const io = req.app.get("io");

  try {
    const { docId, markdown, userLanguage } = req.body;
    if (!docId) return res.status(400).json({ error: "docId is required" });
    if (!markdown) return res.status(400).json({ error: "markdown is required" });

    // 处理AI重新生成
    const result = await handleAiRegeneration(docId, markdown, userLanguage, io);
    
    res.json(result);
  } catch (err) {
    // 通知：重新生成过程中出现错误
    sendSocketNotification(io, "ai:regenerate:error", {
      docId: req.body.docId,
      message: "重新生成AI结构化数据时出现错误",
      error: err.message,
    });

    res.status(500).json({ error: err.message });
  }
});

// TODO: Add new endpoint implementation here

export default router;
