import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { getMyNotifications, markNotificationAsRead,deleteNotificationController,markAllNotificationsAsRead } from "../controllers/notification.js";

const router = express.Router();

router.get("/", protect, getMyNotifications);
router.post("/:id/read", protect, markNotificationAsRead);
router.delete("/:id", protect, deleteNotificationController);
router.post("/mark-all-read", protect, markAllNotificationsAsRead);
export default router;