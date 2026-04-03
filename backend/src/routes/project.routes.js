import express from "express";
import { createProject, getProjectsByTeam, updateProject, deleteProject, getAllProjects  } from "../controllers/project.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post("/",protect,authorizeRoles("admin", "manager"),createProject);
router.get("/team/:teamId", protect, getProjectsByTeam);
router.put("/:projectId", protect, authorizeRoles("admin", "manager"), updateProject);
router.delete("/:projectId", protect, authorizeRoles("admin", "manager"), deleteProject);
router.get("/all/:teamId", protect, getAllProjects);


export default router;
