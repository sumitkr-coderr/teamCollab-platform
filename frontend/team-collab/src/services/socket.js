import { io } from "socket.io-client";

const socket = io("http://localhost:5001", {
  withCredentials: true,
});

// automatically join personal room when connection is established or re‑established
socket.on("connect", () => {
  const stored = localStorage.getItem("user");
  if (stored) {
    try {
      const user = JSON.parse(stored);
      if (user?.id) {
        socket.emit("join", user.id);
      }
    } catch {}
  }
});

export default socket;

