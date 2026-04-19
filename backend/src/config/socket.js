import { Server } from "socket.io";

let io;
export const onlineUsers = new Map();

// helper to broadcast current online user IDs to all connected clients
const emitOnlineUsers = () => {
  if (io) {
    io.emit("online-users", [...onlineUsers.keys()]);
  }
};

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:5173", "https://your-frontend.vercel.app","https://team-collab-platform-one.vercel.app"],
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    // console.log("🔌 User connected:", socket.id);

    // userId may come from handshake query or from a later "join" event
    let userId = socket.handshake.query.userId || null;

    if (userId) {
      onlineUsers.set(userId, socket.id);
      console.log(`✅ User ${userId} is now online with socket: ${socket.id}`);
      emitOnlineUsers();
    }

    // join personal room and update online list
    socket.on("join", (id) => {
      userId = id;
      socket.join(`user_${id}`);
      // console.log(`✅ User joined room: user_${id}`);

      if (id && !onlineUsers.has(id)) {
        onlineUsers.set(id, socket.id);
      }
      emitOnlineUsers();
    });

    // join project-specific room
    socket.on("joinProject", (projectId) => {
      socket.join(`project_${projectId}`);
      // console.log(`✅ User joined project room: project_${projectId}`);
    });

    socket.on("disconnect", () => {
      // console.log("❌ User disconnected:", socket.id);

      if (userId) {
        onlineUsers.delete(userId);
        console.log(`✅ User ${userId} removed from online users`);
        emitOnlineUsers();
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
