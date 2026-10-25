import { Router } from "express";
import { getStudentProgress } from "../controllers/studentProgressController.js";
import { protect, requireStudent } from "../middleware/auth.js";

const router = Router();

router.use(protect, requireStudent);
router.get("/", getStudentProgress);

export default router;
