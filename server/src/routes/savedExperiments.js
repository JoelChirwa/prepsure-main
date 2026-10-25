import express from "express";
import { protect } from "../middleware/auth.js";
import {
    listSavedExperiments,
    removeSavedExperiment,
    saveExperiment,
} from "../controllers/savedExperimentController.js";

const router = express.Router();

router.use(protect);
router.get("/", listSavedExperiments);
router.post("/:experimentId", saveExperiment);
router.delete("/:experimentId", removeSavedExperiment);

export default router;
