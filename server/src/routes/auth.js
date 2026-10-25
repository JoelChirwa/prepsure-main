import { Router } from "express";
import rateLimit from "express-rate-limit";
import { protect } from "../middleware/auth.js";
import {
    changePassword,
    changePin,
    getCurrentUser,
    login,
    register,
    requestPasswordReset,
    resetPassword,
    recoverPin,
    updateProfile,
} from "../controllers/authController.js";

const router = Router();
const passwordResetRequestLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many password reset requests. Try again later.",
    },
});
const passwordResetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many password reset attempts. Try again later.",
    },
});
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many login attempts. Try again later.",
    },
});

router.post("/login", loginLimiter, login);
router.get("/me", protect, getCurrentUser);
router.patch("/me", protect, updateProfile);
router.patch("/password", protect, changePassword);
router.patch("/pin", protect, changePin);
router.post("/password/forgot", passwordResetRequestLimiter, requestPasswordReset);
router.post("/password/reset", passwordResetLimiter, resetPassword);
router.post("/pin/recover", passwordResetLimiter, recoverPin);
router.post("/register", register);

export default router;
