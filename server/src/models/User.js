
import mongoose from "mongoose";
import { CLASS_LEVELS } from "../constants/classLevels.js";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        classLevel: {
            type: String,
            trim: true,
            enum: CLASS_LEVELS,
        },
        phone: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
        },
        email: {
            type: String,
            required: function requiredForAdmin() {
                return this.role === "admin";
            },
            unique: true,
            sparse: true,
            lowercase: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: function requiredForLegacyOrAdmin() {
                return this.role === "admin" || !this.pinHash;
            },
            select: false,
        },
        pinHash: {
            type: String,
            select: false,
        },
        recoveryCodeHash: {
            type: String,
            select: false,
        },
        school: {
            type: String,
            trim: true,
            maxlength: 160,
        },
        district: {
            type: String,
            trim: true,
            maxlength: 100,
        },
        sharedPhoneMode: {
            type: Boolean,
            default: false,
        },
        tokenVersion: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        statusHistory: {
            type: [{
                isActive: { type: Boolean, required: true },
                changedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                reason: { type: String, required: true, maxlength: 500 },
                changedAt: { type: Date, required: true },
            }],
            default: [],
            select: false,
        },
        passwordResetTokenHash: {
            type: String,
            select: false,
        },
        passwordResetExpiresAt: {
            type: Date,
            select: false,
        },
        role: {
            type: String,
            enum: ["student", "admin"],
            default: "student",
        },
    },
    { timestamps: true }
);

export default mongoose.model("User", userSchema);
