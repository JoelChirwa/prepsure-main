import { Router } from "express";
import {
    getStudentStatusHistory,
    listAdminUsers,
    updateStudentAccountStatus,
} from "../controllers/adminUserController.js";
import { protect, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.use(protect, requireAdmin);
router.get("/", listAdminUsers);
router.get("/:id/status-history", getStudentStatusHistory);
router.patch("/:id/status", updateStudentAccountStatus);

export default router;
