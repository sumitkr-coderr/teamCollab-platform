import express from "express";
import { createTask, getTasksByProject,updateTaskStatus,assignTask ,updateTask, deleteTask, findTask,findAllTasks  } from "../controllers/task.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createTask);
router.get("/project/:projectId", protect, getTasksByProject);
router.patch("/:taskId/status", protect, updateTaskStatus);
router.patch("/:taskId/assign", protect, assignTask);
router.put("/:taskId", protect, updateTask);
router.delete("/:taskId", protect, deleteTask);
router.get("/findAll", protect, findAllTasks);

export default router;
