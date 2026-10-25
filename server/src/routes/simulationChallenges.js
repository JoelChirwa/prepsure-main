import { Router } from "express";
import { protect, requireStudent } from "../middleware/auth.js";
import {
    createSimulationChallenge,
    getSimulationChallenge,
    submitSimulationChallenge,
} from "../controllers/simulationChallengeController.js";

const router = Router();

router.get("/:code", getSimulationChallenge);
router.post("/:code/result", submitSimulationChallenge);
router.post("/", protect, requireStudent, createSimulationChallenge);

export default router;
