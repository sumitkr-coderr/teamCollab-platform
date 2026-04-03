import express from "express";
import { createTeam, getMyTeams,getTeamById, updateTeam, deleteTeam } from "../controllers/team.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post("/",protect,authorizeRoles("admin", "manager"),createTeam);
router.get("/", protect, getMyTeams);
router.get("/:id", protect, getTeamById);
router.put("/:id", protect,authorizeRoles("admin", "manager"), updateTeam);
router.delete("/:id", protect,authorizeRoles("admin", "manager"), deleteTeam);

export default router;
