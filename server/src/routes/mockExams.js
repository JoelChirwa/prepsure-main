import { Router } from "express";
import {
    getMockExamAttempt,
    listMockExams,
    saveMockExamAnswer,
    startMockExam,
    submitMockExam,
} from "../controllers/mockExamController.js";
import { protect, requireStudent } from "../middleware/auth.js";

const router = Router();

router.use(protect, requireStudent);
router.get("/", listMockExams);
router.post("/:examId/attempts", startMockExam);
router.get("/attempts/:attemptId", getMockExamAttempt);
router.patch("/attempts/:attemptId/answers", saveMockExamAnswer);
router.post("/attempts/:attemptId/submit", submitMockExam);

export default router;
