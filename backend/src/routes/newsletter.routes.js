import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { subscribe } from "../controllers/newsletter.controller.js";

const router = express.Router();


router.post("/subscribe", subscribe);

export default router;