import { useEffect, useState } from "react";
import API from "../services/api";
import { useSocket } from "../services/SocketContext";
import { FaTrash, FaCheckDouble, FaCheck } from "react-icons/fa";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const socket = useSocket();

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/notifications");
      setNotifications(data.data || []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete notification
  const handleDeleteNotification = async (notificationId) => {
    try {
      setDeletingId(notificationId);
      await API.delete(`/notifications/${notificationId}`, {
        toastMessage: "Notification deleted",
      });
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    } finally {
      setDeletingId(null);
    }
  };

  // Delete all notifications
  const handleDeleteAll = async () => {
    if (notifications.length === 0) return;
    
    try {
      await Promise.all(
        notifications.map(notification => 
          API.delete(`/notifications/${notification.id}`)
        )
      );
      
      setNotifications([]);
    } catch (error) {
      console.error("Failed to delete all notifications:", error);
    }
  };

  // Mark single notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await API.post(`/notifications/${notificationId}/read`);
      
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.isRead);
    if (unreadNotifications.length === 0) return;
    
    setMarkingAllRead(true);
    
    try {
      // Option 1: Call API to mark all as read (if you have this endpoint)
      await API.post("/notifications/mark-all-read");
      
      // Option 2: If you don't have a bulk endpoint, mark each individually
      // await Promise.all(
      //   unreadNotifications.map(notification => 
      //     API.post(`/notifications/${notification.id}/read`)
      //   )
      // );
      
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      
      // Fallback: Mark each individually if bulk endpoint fails
      try {
        const unreadNotifs = notifications.filter(n => !n.isRead);
        await Promise.all(
          unreadNotifs.map(notification => 
            API.post(`/notifications/${notification.id}/read`)
          )
        );
        setNotifications(prev =>
          prev.map(n => ({ ...n, isRead: true }))
        );
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
      }
    } finally {
      setMarkingAllRead(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const handleNotification = (data) => {
      const newNotification = {
        id: data.id || Date.now(),
        message: data.message,
        createdAt: new Date(),
        isRead: false,
        ...data,
      };
      
      setNotifications((prev) => [newNotification, ...prev]);
      
      // Auto-delete after 1 minute (60000 ms)
      setTimeout(() => {
        if (newNotification.id) {
          handleDeleteNotification(newNotification.id);
        }
      }, 60000);
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [socket]);

  // Auto-delete notifications after 1 minute (for existing unread notifications)
  useEffect(() => {
    const timers = [];
    
    notifications.forEach(notification => {
      if (!notification.isRead) {
        const timer = setTimeout(() => {
          handleDeleteNotification(notification.id);
        }, 60000);
        timers.push(timer);
      }
    });
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [notifications]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600">Loading notifications...</p>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const readCount = notifications.filter(n => n.isRead).length;

  return (
    <div className="p-6">
      {/* Header with action buttons */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount} unread, {readCount} read
          </p>
        </div>
        
        <div className="flex gap-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={markingAllRead}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition disabled:opacity-50"
            >
              {markingAllRead ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent"></div>
              ) : (
                <FaCheckDouble size={14} />
              )}
              Mark all as read
            </button>
          )}
          
          {notifications.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
            >
              <FaTrash size={14} />
              Delete all
            </button>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      {notifications.length > 0 && (
        <div className="mb-4 flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
            <span className="text-gray-600">Unread: {unreadCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <span className="text-gray-600">Read: {readCount}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 animate-fadeIn">
            <div className="relative mb-6">
              <div className="text-7xl animate-bounce-slow">🔔</div>
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-gray-300 rounded-full animate-pulse"></div>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-700 mb-2 animate-slideUp">
              No notifications yet!
            </h3>
            
            <p className="text-gray-500 text-center max-w-sm animate-slideUp animation-delay-200">
              When you get notifications, they'll appear here. Stay tuned for updates!
            </p>
          </div>
        ) : (
          <div>
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`border-b last:border-none p-4 transition-all hover:bg-gray-50 group ${
                  n.isRead ? "bg-white" : "bg-indigo-50/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Notification icon based on read status */}
                  <span className="text-xl">
                    {n.isRead ? "📫" : "📬"}
                  </span>
                  
                  <div className="flex-1 cursor-pointer" onClick={() => !n.isRead && handleMarkAsRead(n.id)}>
                    <p className={n.isRead ? "text-gray-500" : "text-gray-900 font-semibold"}>
                      {n.message}
                    </p>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-xs text-gray-400">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                      {!n.isRead && (
                        <span className="text-xs text-indigo-600 animate-pulse flex items-center gap-1">
                          <FaCheck size={10} /> Click to mark read
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNotification(n.id);
                    }}
                    disabled={deletingId === n.id}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                    title="Delete notification"
                  >
                    {deletingId === n.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent"></div>
                    ) : (
                      <FaTrash size={14} />
                    )}
                  </button>
                  
                  {!n.isRead && (
                    <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse mt-2"></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer with auto-delete info */}
      {notifications.length > 0 && (
        <div className="mt-4 text-xs text-gray-400 text-center">
          Unread notifications will be automatically deleted after 1 minute
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;