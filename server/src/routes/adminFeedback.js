import { Router } from "express";
import {
    listAdminFeedback,
    updateAdminFeedback,
} from "../controllers/feedbackController.js";
import { protect, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.use(protect, requireAdmin);
router.get("/", listAdminFeedback);
router.patch("/:id", updateAdminFeedback);

export default router;
