import {getMyNotificationsService, markAsRead, deleteNotification,markAllAsRead} from "../services/notification.service.js";


export const getMyNotifications = async (req, res) => { 
    try {
        // service returns the notifications array
        const notifications = await getMyNotificationsService(req.user.id);
        // activity logging (non‑persistent) could also be done in service if desired
        res.status(200).json({ success: true, data: notifications });
    }
    catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ success: false, message: "Failed to fetch notifications" });
    }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    await markAsRead(req, res);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ success: false, message: "Failed to mark notification as read" });
  }
};

export const deleteNotificationController = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteNotification(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ success: false, message: "Failed to delete notification" });
  } 
};

export const markAllNotificationsAsRead = async (req, res) => {
  try {
    await markAllAsRead(req.user.id); 
    res.json({ success: true });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ success: false, message: "Failed to mark all notifications as read" });
  } 
};