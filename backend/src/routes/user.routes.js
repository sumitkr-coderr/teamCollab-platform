import express from "express";
import { getMyProfile , uploadAvatar, getAllUsers,findAllUsers} from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import upload from "../middlewares/upload.js";   

const router = express.Router();

router.get("/me", protect,authorizeRoles("admin", "manager", "member"), getMyProfile);
router.post("/avatar", protect, upload.single("avatar"), uploadAvatar);
router.get("/", protect, authorizeRoles("admin"), getAllUsers);
router.get("/findAll", protect, authorizeRoles("admin"), findAllUsers);
export default router;
