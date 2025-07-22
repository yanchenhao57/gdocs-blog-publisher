import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import convertRouter from "./routes/convert.js";
import publishRouter from "./routes/publish.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// 静态文件服务
app.use(express.static(join(__dirname, "../public")));

// 根路径处理
app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "../public/index.html"));
});

// API 路由
app.use("/api/convert-doc", convertRouter);
app.use("/api/publish", publishRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
  console.log(`Visit http://localhost:${PORT} to use the tool`);
});
