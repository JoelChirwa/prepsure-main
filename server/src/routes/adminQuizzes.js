import { Router } from "express";
import {
    createQuiz,
    getAdminQuiz,
    listAdminQuizzes,
    retireQuiz,
    updateQuiz,
} from "../controllers/quizController.js";
import { protect, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.use(protect, requireAdmin);
router.get("/", listAdminQuizzes);
router.post("/", createQuiz);
router.get("/:id", getAdminQuiz);
router.put("/:id", updateQuiz);
router.delete("/:id", retireQuiz);

export default router;
