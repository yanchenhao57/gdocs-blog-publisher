import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import convertRouter from "./routes/convert.js";
import publishRouter from "./routes/publish.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // 在生产环境中应该设置具体的域名
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// 静态文件服务
app.use(express.static(join(__dirname, "../public")));

// 根路径处理
app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "../public/index.html"));
});

// Socket.io演示页面
app.get("/socket-demo", (req, res) => {
  res.sendFile(join(__dirname, "../public/socket-demo.html"));
});

// Socket.io 连接处理
io.on("connection", (socket) => {
  console.log("🔌 客户端已连接:", socket.id);
  
  socket.on("disconnect", () => {
    console.log("🔌 客户端已断开:", socket.id);
  });
});

// 将 io 实例添加到 app 对象中，以便在路由中使用
app.set("io", io);

// API 路由
app.use("/api/convert-doc", convertRouter);
app.use("/api/publish", publishRouter);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 API server running at http://localhost:${PORT}`);
  console.log(`🔌 Socket.io server ready`);
  console.log(`📱 Visit http://localhost:${PORT} to use the tool`);
});
