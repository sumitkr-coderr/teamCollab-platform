import db from "../models/index.js";
const { Notification, User } = db;
import { broadcast } from "../utils/socketNotifier.js";

export const getMyNotificationsService = async (userId) => {
    return await Notification.findAll({
        where: { userId },
        order: [["createdAt", "DESC"]],
            include: [
            {
                model: User,
                as: "user",
                attributes: ["id", "name", "email"],
            },
        ],

    });};

export const markAsRead = async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findByPk(id);
  if (!notification) {
    return res.status(404).json({ message: "Not found" });
  }

  notification.isRead = true;
  await notification.save();

  res.json({ success: true });
};

export const deleteNotification = async (id) => {
  await Notification.destroy({ where: { id } });
};


export const markAllAsRead = async (userId) => {
  await Notification.update({ isRead: true }, { where: { userId } }); 
  await broadcast("activity", {
    userId,
    message: `User ${userId} marked all notifications as read`,
    timestamp: new Date(),
  })
}

    


