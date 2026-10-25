import { Router } from "express";
import { getSimulationPack } from "../controllers/simulationPackController.js";

const router = Router();
router.get("/:slug", getSimulationPack);

export default router;
