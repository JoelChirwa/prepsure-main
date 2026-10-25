import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import User from "../models/User.js";
import { CLASS_LEVELS } from "../constants/classLevels.js";
import { env } from "../config/env.js";
import {
    isEmailDeliveryConfigured,
    sendPasswordResetEmail,
} from "../services/email.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const pinPattern = /^\d{4,6}$/;
const passwordResetMessage =
    "If an account exists for that email, password reset instructions will be sent.";

function normalizePhone(phone) {
    const compact = phone.trim().replace(/[()\s-]/g, "");

    if (compact.startsWith("+")) {
        return `+${compact.slice(1).replace(/\D/g, "")}`;
    }

    return compact.replace(/\D/g, "");
}

function publicUser(user) {
    return {
        id: user._id.toString(),
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        classLevel: user.classLevel,
        school: user.school,
        district: user.district,
        sharedPhoneMode: user.sharedPhoneMode,
        isActive: user.isActive,
    };
}

function createAccessToken(user) {
    if (!env.jwtSecret) {
        throw new Error("Authentication is not configured.");
    }

    return jwt.sign(
        {
            sub: user._id.toString(),
            tokenVersion: user.tokenVersion ?? 0,
        },
        env.jwtSecret,
        { expiresIn: "8h" }
    );
}

export async function login(req, res, next) {
    try {
        if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
            return res.status(400).json({
                message: "Email and password are required.",
            });
        }

        const { email, password, phone, pin } = req.body;

        const isPinLogin = typeof phone === "string" || typeof pin === "string";
        if (isPinLogin && (
            typeof phone !== "string" ||
            typeof pin !== "string" ||
            !pinPattern.test(pin) ||
            normalizePhone(phone).length < 7
        )) {
            return res.status(400).json({
                message: "Enter a valid phone number and 4 to 6 digit PIN.",
            });
        }

        if (!isPinLogin && (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        )) {
            return res.status(400).json({
                message: "Enter your phone number and PIN.",
            });
        }

        const user = await User.findOne(
            isPinLogin
                ? { phone: normalizePhone(phone) }
                : { email: email.trim().toLowerCase() }
        ).select("+passwordHash +pinHash");
        const passwordMatches = user && (
            isPinLogin
                ? user.pinHash && await bcrypt.compare(pin, user.pinHash)
                : user.passwordHash && await bcrypt.compare(password, user.passwordHash)
        );

        if (!passwordMatches) {
            return res.status(401).json({
                message: "Invalid phone number or PIN.",
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                message: "This account is suspended. Contact an administrator for assistance.",
            });
        }

        if (!env.jwtSecret) {
            return res.status(500).json({
                message: "Authentication is not configured.",
            });
        }

        const token = createAccessToken(user);
        return res.json({
            token,
            user: publicUser(user),
        });
    } catch (error) {
        return next(error);
    }
}

export function getCurrentUser(req, res) {
    return res.json({
        user: publicUser(req.user),
    });
}

export async function updateProfile(req, res, next) {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Student access is required to update this profile.",
            });
        }

        if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
            return res.status(400).json({
                message: "Enter a name and class level.",
            });
        }

        const { name, classLevel, school, district, sharedPhoneMode } = req.body;

        if (
            typeof name !== "string" ||
            typeof classLevel !== "string" ||
            name.trim().length < 2 ||
            name.trim().length > 100 ||
            !CLASS_LEVELS.includes(classLevel.trim()) ||
            (school !== undefined && typeof school !== "string") ||
            (district !== undefined && typeof district !== "string")
        ) {
            return res.status(400).json({
                message: "Enter a name and class level using the allowed lengths.",
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    name: name.trim(),
                    classLevel: classLevel.trim(),
                    school: typeof school === "string" ? school.trim() : "",
                    district: typeof district === "string" ? district.trim() : "",
                    sharedPhoneMode: Boolean(sharedPhoneMode),
                },
            },
            { new: true, runValidators: true }
        ).select("_id name email role classLevel");

        if (!user) {
            return res.status(404).json({
                message: "User account no longer exists.",
            });
        }

        return res.json({
            message: "Profile updated successfully.",
            user: {
                ...publicUser(user),
            },
        });
    } catch (error) {
        return next(error);
    }
}

export async function changePassword(req, res, next) {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Student access is required to change this password.",
            });
        }

        const { currentPassword, newPassword } = req.body || {};

        if (
            typeof currentPassword !== "string" ||
            typeof newPassword !== "string" ||
            newPassword.length < 8 ||
            newPassword.length > 128
        ) {
            return res.status(400).json({
                message: "Enter your current password and a new password of at least 8 characters.",
            });
        }

        const user = await User.findById(req.user._id).select(
            "+passwordHash tokenVersion"
        );

        if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
            return res.status(400).json({
                message: "Your current password is incorrect.",
            });
        }

        user.passwordHash = await bcrypt.hash(newPassword, 12);
        user.tokenVersion = (user.tokenVersion ?? 0) + 1;
        await user.save();

        return res.json({
            message: "Password changed successfully.",
            token: createAccessToken(user),
        });
    } catch (error) {
        return next(error);
    }
}

export async function changePin(req, res, next) {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Student access is required to change the PIN.",
            });
        }

        const { currentPin, newPin } = req.body || {};
        if (!pinPattern.test(currentPin || "") || !pinPattern.test(newPin || "")) {
            return res.status(400).json({
                message: "Enter your current PIN and a new 4 to 6 digit PIN.",
            });
        }

        const user = await User.findById(req.user._id).select("+pinHash tokenVersion");
        if (!user?.pinHash || !(await bcrypt.compare(currentPin, user.pinHash))) {
            return res.status(400).json({ message: "Your current PIN is incorrect." });
        }

        user.pinHash = await bcrypt.hash(newPin, 12);
        user.tokenVersion += 1;
        await user.save();

        return res.json({
            message: "PIN changed successfully.",
            token: createAccessToken(user),
        });
    } catch (error) {
        return next(error);
    }
}

export async function recoverPin(req, res, next) {
    try {
        const { phone, recoveryCode, newPin } = req.body || {};
        const normalizedPhone = typeof phone === "string" ? normalizePhone(phone) : "";

        if (
            normalizedPhone.length < 7 ||
            typeof recoveryCode !== "string" ||
            !/^[A-Z0-9]{10}$/.test(recoveryCode.trim().toUpperCase()) ||
            !pinPattern.test(newPin || "")
        ) {
            return res.status(400).json({
                message: "Enter your phone number, recovery code, and a new 4 to 6 digit PIN.",
            });
        }

        const user = await User.findOne({ phone: normalizedPhone })
            .select("+recoveryCodeHash tokenVersion");
        if (!user?.recoveryCodeHash || !(await bcrypt.compare(
            recoveryCode.trim().toUpperCase(),
            user.recoveryCodeHash
        ))) {
            return res.status(400).json({
                message: "The recovery details are not valid.",
            });
        }

        user.pinHash = await bcrypt.hash(newPin, 12);
        user.recoveryCodeHash = undefined;
        user.tokenVersion += 1;
        await user.save();

        return res.json({ message: "PIN reset successfully. You can now log in." });
    } catch (error) {
        return next(error);
    }
}

export async function requestPasswordReset(req, res, next) {
    try {
        const email = typeof req.body?.email === "string"
            ? req.body.email.trim().toLowerCase()
            : "";

        if (!emailPattern.test(email)) {
            return res.status(400).json({
                message: "Enter a valid email address.",
            });
        }

        if (!env.isClientUrlConfigured || !isEmailDeliveryConfigured()) {
            return res.status(503).json({
                message: "Password recovery is not configured.",
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ message: passwordResetMessage });
        }

        const rawToken = crypto.randomBytes(32).toString("hex");
        user.passwordResetTokenHash = crypto
            .createHash("sha256")
            .update(rawToken)
            .digest("hex");
        user.passwordResetExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
        await user.save();

        const resetUrl = new URL("/reset-password", env.clientUrl);
        resetUrl.searchParams.set("token", rawToken);

        try {
            await sendPasswordResetEmail({
                email: user.email,
                name: user.name,
                resetUrl: resetUrl.toString(),
            });
        } catch (error) {
            user.passwordResetTokenHash = undefined;
            user.passwordResetExpiresAt = undefined;
            await user.save();
            throw error;
        }

        return res.json({ message: passwordResetMessage });
    } catch (error) {
        return next(error);
    }
}

export async function resetPassword(req, res, next) {
    try {
        const { token, newPassword } = req.body || {};

        if (
            typeof token !== "string" ||
            !/^[a-f0-9]{64}$/i.test(token) ||
            typeof newPassword !== "string" ||
            newPassword.length < 8 ||
            newPassword.length > 128
        ) {
            return res.status(400).json({
                message: "The reset link or new password is invalid.",
            });
        }

        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
        const user = await User.findOne({
            passwordResetTokenHash: tokenHash,
            passwordResetExpiresAt: { $gt: new Date() },
        }).select("+passwordResetTokenHash +passwordResetExpiresAt tokenVersion");

        if (!user) {
            return res.status(400).json({
                message: "This password reset link is invalid or has expired.",
            });
        }

        const passwordHash = await bcrypt.hash(newPassword, 12);
        const updatedUser = await User.findOneAndUpdate(
            {
                _id: user._id,
                passwordResetTokenHash: tokenHash,
                passwordResetExpiresAt: { $gt: new Date() },
            },
            {
                $set: { passwordHash },
                $inc: { tokenVersion: 1 },
                $unset: {
                    passwordResetTokenHash: "",
                    passwordResetExpiresAt: "",
                },
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(400).json({
                message: "This password reset link is invalid or has expired.",
            });
        }

        return res.json({
            message: "Password reset successfully. You can now log in.",
        });
    } catch (error) {
        return next(error);
    }
}

export async function register(req, res, next) {
    try {
        if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
            return res.status(400).json({
                message:
                    "Enter your name, phone number, class level, and a 4 to 6 digit PIN.",
            });
        }

        const { name, phone, pin, classLevel, school, district } = req.body;
        const normalizedPhone = typeof phone === "string" ? normalizePhone(phone) : "";

        if (
            typeof name !== "string" ||
            typeof phone !== "string" ||
            typeof pin !== "string" ||
            typeof classLevel !== "string" ||
            name.trim().length < 2 ||
            name.trim().length > 100 ||
            normalizedPhone.length < 7 ||
            !pinPattern.test(pin) ||
            !CLASS_LEVELS.includes(classLevel.trim()) ||
            (school !== undefined && typeof school !== "string") ||
            (district !== undefined && typeof district !== "string")
        ) {
            return res.status(400).json({
                message:
                    "Enter your name, phone number, class level, and a 4 to 6 digit PIN.",
            });
        }

        if (!env.jwtSecret) {
            return res.status(500).json({
                message: "Authentication is not configured.",
            });
        }

        const existingUser = await User.findOne({
            phone: normalizedPhone,
        });

        if (existingUser) {
            return res.status(409).json({
                message: "This phone number is already registered. Log in or recover your PIN instead.",
            });
        }

        const pinHash = await bcrypt.hash(pin, 12);
        const recoveryCode = crypto.randomBytes(5).toString("hex").toUpperCase();
        const user = await User.create({
            name: name.trim(),
            phone: normalizedPhone,
            classLevel: classLevel.trim(),
            pinHash,
            recoveryCodeHash: await bcrypt.hash(recoveryCode, 12),
            school: typeof school === "string" ? school.trim() : "",
            district: typeof district === "string" ? district.trim() : "",
            role: "student",
        });
        const token = createAccessToken(user);

        return res.status(201).json({
            message: "Student account created successfully.",
            token,
            recoveryCode,
            user: publicUser(user),
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "An account with this email already exists.",
            });
        }

        return next(error);
    }
}
