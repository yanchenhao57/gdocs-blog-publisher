// Socket通知辅助函数
function sendSocketNotification(io, event, data) {
  if (io) {
    io.emit(event, {
      timestamp: new Date().toISOString(),
      ...data,
    });
    console.log(`🔌 Socket通知: ${event}`, data);
  }
}

export { sendSocketNotification };
