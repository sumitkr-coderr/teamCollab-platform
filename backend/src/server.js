import "./config/env.js";
import http from "http";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import db from "./models/index.js";
import { initSocket } from "./config/socket.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    await db.sequelize.sync();

    const server = http.createServer(app);
    initSocket(server);
    server.listen(PORT, () => {
      // console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server failed to start:", error);
    process.exit(1);
  }
};

startServer();
