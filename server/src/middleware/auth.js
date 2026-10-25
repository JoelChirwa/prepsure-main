import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { env } from "../config/env.js";

export async function protect(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Authentication required.",
            });
        }

        const token = authHeader.slice(7);
        const secret = env.jwtSecret;

        if (!secret) {
            return res.status(500).json({
                message: "Authentication is not configured.",
            });
        }

        const decoded = jwt.verify(token, secret);

        const user = await User.findById(decoded.sub).select(
            "_id name phone email role classLevel school district sharedPhoneMode tokenVersion isActive"
        );

        if (!user || (decoded.tokenVersion ?? 0) !== (user.tokenVersion ?? 0)) {
            return res.status(401).json({
                message: "Session is no longer valid. Please log in again.",
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                message: "This account is suspended. Contact an administrator for assistance.",
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Invalid or expired token.",
            });
        }

        next(error);
    }
}

export function requireAdmin(req, res, next) {
    if (req.user?.role !== "admin") {
        return res.status(403).json({
            message: "Administrator access required.",
        });
    }

    next();
}

export function requireStudent(req, res, next) {
    if (req.user?.role !== "student") {
        return res.status(403).json({
            message: "Student access is required to track experiment progress.",
        });
    }

    next();
}