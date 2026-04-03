import { useState, useEffect, useRef } from "react";
import API from "../services/api";

const Topbar = ({ 
  notifications, 
  setNotifications, 
  onlineUsers = [],
  onMenuClick
}) => {
  const [openPanel, setOpenPanel] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  const [user, setUser] = useState(null);

  useEffect(() => {
    // Try both storage options
    let userData = sessionStorage.getItem("user");
    if (!userData) {
      userData = localStorage.getItem("user");
    }
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Failed to parse user data:", error);
      }
    }
  }, []);

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  // MARK SINGLE NOTIFICATION READ
  const handleMarkRead = async (id) => {
    try {
      await API.post(`/notifications/${id}/read`);
      
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  // MARK ALL READ
  const markAllRead = async () => {
    if (unreadCount === 0) return;
    
    setMarkingAllRead(true);
    try {
      // Try bulk endpoint first
      await API.post("/notifications/mark-all-read");
      
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Bulk mark all failed:", err);
      
      // Fallback: mark each individually
      try {
        const unreadNotifications = notifications.filter(n => !n.isRead);
        await Promise.all(
          unreadNotifications.map(notification => 
            API.post(`/notifications/${notification.id}/read`)
          )
        );
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
      }
    } finally {
      setMarkingAllRead(false);
    }
  };

  // AVATAR UPLOAD
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setPreviewAvatar(preview);

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const { data } = await API.post("/users/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedUser = {
        ...user,
        avatar: data.avatar,
      };

      sessionStorage.setItem("user", JSON.stringify(updatedUser));
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setPreviewAvatar(null);
    } catch (err) {
      console.error("Failed to upload avatar:", err);
      setPreviewAvatar(null);
    }
  };

  // LOGOUT
  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = "/login";
  };

  // CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setOpenProfile(false);
      }
      
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setOpenPanel(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewAvatar) {
        URL.revokeObjectURL(previewAvatar);
      }
    };
  }, [previewAvatar]);

  // Don't render if user isn't loaded yet
  if (!user) {
    return (
      <div className="h-16 bg-gray-900 flex items-center justify-between px-6 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
          <div className="h-4 w-32 bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
          <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-16 bg-gray-900 flex items-center justify-between px-4 sm:px-6 border-b border-gray-800 relative">
      {/* Left section */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className="md:hidden text-white text-2xl hover:text-indigo-400 transition"
          aria-label="Open menu"
        >
          ☰
        </button>

        <div className="hidden sm:block relative max-w-md w-full">
          <input
            placeholder="Search..."
            className="w-full bg-gray-800 text-white px-4 py-2 pl-10 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <svg 
            className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* NOTIFICATIONS */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setOpenPanel((prev) => !prev)}
            className="text-white text-xl hover:scale-110 transition relative"
            aria-label="Notifications"
          >
            🔔
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {openPanel && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white shadow-2xl rounded-xl z-50 max-h-[32rem] overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-purple-600">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
              </div>

              <div className="overflow-y-auto max-h-80">
                {notifications?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4">
                    <span className="text-4xl mb-3">🔔</span>
                    <p className="text-gray-500 text-sm text-center">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkRead(n.id)}
                      className={`border-b last:border-none py-3 px-4 text-sm cursor-pointer transition-all
                        ${n.isRead 
                          ? "text-gray-500 hover:bg-gray-50" 
                          : "font-semibold bg-indigo-50/50 hover:bg-indigo-100/50"
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg">
                          {n.isRead ? "📫" : "📬"}
                        </span>
                        <div className="flex-1">
                          <p className={n.isRead ? "text-gray-600" : "text-gray-900"}>
                            {n.message}
                          </p>
                          <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                            <span>🕒</span>
                            {new Date(n.createdAt).toLocaleString()}
                          </div>
                        </div>
                        {!n.isRead && (
                          <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {notifications?.length > 0 && unreadCount > 0 && (
                <div className="p-3 border-t border-gray-100 bg-gray-50">
                  <button
                    onClick={markAllRead}
                    disabled={markingAllRead}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium w-full text-center flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {markingAllRead ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-indigo-600 border-t-transparent"></div>
                        Marking...
                      </>
                    ) : (
                      'Mark all as read'
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* PROFILE SECTION */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setOpenProfile((prev) => !prev)}
            className="flex items-center gap-2 text-white hover:opacity-80 transition"
            aria-label="Profile menu"
          >
            <div className="relative">
              {previewAvatar ? (
                <img
                  src={previewAvatar}
                  alt="Preview avatar"
                  className="w-9 h-9 rounded-full object-cover border-2 border-transparent hover:border-indigo-400 transition"
                />
              ) : user?.avatar ? (
                <img
                  src={`http://localhost:5001${user.avatar}`}
                  alt="User avatar"
                  className="w-9 h-9 rounded-full object-cover border-2 border-transparent hover:border-indigo-400 transition"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff`;
                  }}
                />
              ) : (
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center font-bold text-white border-2 border-transparent hover:border-indigo-400 transition">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              
              {onlineUsers?.includes(user?.id) && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></span>
              )}
            </div>

            <span className="hidden md:block text-sm font-medium">
              {user?.name}
            </span>
            
            <svg 
              className={`hidden md:block w-4 h-4 transition-transform duration-200 ${openProfile ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {openProfile && (
            <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl z-50 overflow-hidden animate-slideDown">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-6">
                <div className="flex flex-col items-center">
                  {previewAvatar ? (
                    <img
                      src={previewAvatar}
                      alt="Preview avatar"
                      className="w-16 h-16 rounded-full object-cover border-4 border-white/30"
                    />
                  ) : user?.avatar ? (
                    <img
                      src={`http://localhost:5001${user.avatar}`}
                      alt="User avatar"
                      className="w-16 h-16 rounded-full object-cover border-4 border-white/30"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff&size=64`;
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center text-2xl font-bold border-4 border-white/30">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <h3 className="mt-3 font-bold text-white">{user?.name}</h3>
                  <p className="text-sm text-indigo-100 capitalize">{user?.role}</p>
                </div>
              </div>

              <div className="p-2">
                <button
                  onClick={() => {/* Navigate to profile */}}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition flex items-center gap-3"
                >
                  <span>👤</span>
                  My Profile
                </button>
                
                <button
                  onClick={() => {/* Navigate to settings */}}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition flex items-center gap-3"
                >
                  <span>⚙️</span>
                  Settings
                </button>

                <label
                  htmlFor="avatar-upload-mobile"
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition flex items-center gap-3 cursor-pointer"
                >
                  <span>📸</span>
                  Change Avatar
                  <input
                    id="avatar-upload-mobile"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleAvatarUpload}
                  />
                </label>

                <div className="border-t my-2"></div>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-3"
                >
                  <span>🚪</span>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;