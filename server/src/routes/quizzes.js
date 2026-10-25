import { Router } from "express";
import {
    getPublishedQuiz,
    getStudentAttempt,
    listPublishedQuizzes,
    listStudentAttempts,
    submitQuizAttempt,
} from "../controllers/quizController.js";
import { protect, requireStudent } from "../middleware/auth.js";

const router = Router();

router.use(protect, requireStudent);
router.get("/", listPublishedQuizzes);
router.get("/attempts", listStudentAttempts);
router.get("/attempts/:attemptId", getStudentAttempt);
router.get("/:id", getPublishedQuiz);
router.post("/:id/attempts", submitQuizAttempt);

export default router;
