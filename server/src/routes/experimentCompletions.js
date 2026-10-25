import express from "express";
import { protect, requireStudent } from "../middleware/auth.js";
import {
    getCompletionCount,
    getExperimentCompletion,
    markExperimentComplete,
} from "../controllers/experimentCompletionController.js";

const router = express.Router();

router.use(protect, requireStudent);
router.get("/", getCompletionCount);
router.get("/:experimentId", getExperimentCompletion);
router.post("/:experimentId", markExperimentComplete);

export default router;
