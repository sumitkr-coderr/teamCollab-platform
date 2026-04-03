import express from "express";
import { addTeamMember, removeTeamMember,getTeamMembers } from "../controllers/teamMember.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post("/add",protect,authorizeRoles("admin", "manager"),addTeamMember);
router.delete("/remove",protect,authorizeRoles("admin", "manager"),removeTeamMember);
router.get("/:teamId",protect,getTeamMembers);

export default router;
