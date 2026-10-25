import { Router } from "express";
import { protect, requireAdmin } from "../middleware/auth.js";
import {
    listSimulationDefinitions,
    updateSimulationDefinition,
} from "../controllers/adminSimulationController.js";

const router = Router();
router.use(protect, requireAdmin);
router.get("/", listSimulationDefinitions);
router.patch("/:slug", updateSimulationDefinition);

export default router;
