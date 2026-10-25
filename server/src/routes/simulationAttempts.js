import { Router } from "express";
import { protect, requireStudent } from "../middleware/auth.js";
import {
    listSimulationAttempts,
    syncSimulationAttempt,
} from "../controllers/simulationAttemptController.js";

const router = Router();

router.use(protect, requireStudent);
router.get("/", listSimulationAttempts);
router.post("/sync", syncSimulationAttempt);

export default router;
