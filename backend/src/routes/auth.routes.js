import express from "express";
import { registerUser, loginUser, uploadAvatar,vertifyToken } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-token", vertifyToken);
router.post("/avatar", uploadAvatar);

export default router;
