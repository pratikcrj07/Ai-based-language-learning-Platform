import { Router } from "express";
import { getProgress, updateProgress } from "../controllers/progress.controller.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/progress", isAuthenticated, getProgress);
router.put("/progress", isAuthenticated, updateProgress);

export default router;

