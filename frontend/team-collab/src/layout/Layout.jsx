// layout/Layout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Footer from "./Footer"; // Import Footer
import { useEffect, useState } from "react";
import socket from "../services/socket";
import API from "../services/api";

const Layout = () => {
  const [notifications, setNotifications] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await API.get("/notifications");
        setNotifications(data.notifications || []);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    fetchNotifications();

    const handleNotification = (data) => {
      setNotifications((prev) => [
        {
          id: Date.now(),
          message: data.message,
          createdAt: new Date(),
          ...data
        },
        ...prev,
      ]);
    };

    const handleOnlineUsers = (users) => {
      setOnlineUsers(users);
    };

    socket.on("notification", handleNotification);
    socket.on("online-users", handleOnlineUsers);

    return () => {
      socket.off("notification", handleNotification);
      socket.off("online-users", handleOnlineUsers);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 fixed h-screen">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <>
          <div 
            className="md:hidden fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="md:hidden fixed inset-y-0 left-0 w-64 bg-white z-50 animate-slideRight">
            <Sidebar />
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0 md:ml-64">
        <Topbar
          notifications={notifications}
          setNotifications={setNotifications}
          onlineUsers={onlineUsers}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1">
          <Outlet />
        </main>

        {/* Footer - Now appears on all protected pages */}
        <Footer />
      </div>
    </div>
  );
};

export default Layout;