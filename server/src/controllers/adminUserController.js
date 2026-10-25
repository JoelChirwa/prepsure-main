import mongoose from "mongoose";
import User from "../models/User.js";

export async function listAdminUsers(req, res, next) {
    try {
        const { search, status } = req.query;
        if (
            search !== undefined &&
            (typeof search !== "string" || search.length > 100)
        ) {
            return res.status(400).json({ message: "Search must be up to 100 characters." });
        }
        if (status && !["active", "suspended", "all"].includes(status)) {
            return res.status(400).json({ message: "Choose a valid account status." });
        }

        const filter = { role: "student" };
        if (status === "active") filter.isActive = { $ne: false };
        if (status === "suspended") filter.isActive = false;
        if (search?.trim()) {
            const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const expression = new RegExp(escaped, "i");
            filter.$or = [{ name: expression }, { email: expression }];
        }

        const parsedPage = Number.parseInt(req.query.page, 10);
        const page = Number.isInteger(parsedPage) && parsedPage > 0
            ? parsedPage
            : 1;
        const limit = 25;
        const [total, users] = await Promise.all([
            User.countDocuments(filter),
            User.find(filter)
                .select("_id name email classLevel role isActive createdAt updatedAt")
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
        ]);

        return res.json({
            users: users.map((user) => ({ ...user, isActive: user.isActive !== false })),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        return next(error);
    }
}

export async function updateStudentAccountStatus(req, res, next) {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid user ID." });
    }
    const { isActive, reason } = req.body || {};
    if (
        typeof isActive !== "boolean" ||
        typeof reason !== "string" ||
        reason.trim().length < 3 ||
        reason.trim().length > 500
    ) {
        return res.status(400).json({
            message: "Choose an account status and provide a reason of 3–500 characters.",
        });
    }
    if (String(req.user._id) === req.params.id) {
        return res.status(400).json({ message: "You cannot change your own account status." });
    }

    try {
        const target = await User.findOne({
            _id: req.params.id,
            role: "student",
        }).select("_id name email role isActive tokenVersion");
        if (!target) {
            return res.status(404).json({ message: "Student account not found." });
        }
        if ((target.isActive !== false) === isActive) {
            return res.json({
                message: `Student account is already ${isActive ? "active" : "suspended"}.`,
                user: {
                    id: target._id,
                    name: target.name,
                    email: target.email,
                    role: target.role,
                    isActive: target.isActive !== false,
                },
            });
        }

        const now = new Date();
        const statusFilter = target.isActive === false
            ? { isActive: false }
            : {
                $or: [
                    { isActive: true },
                    { isActive: { $exists: false } },
                ],
            };
        const updated = await User.findOneAndUpdate(
            {
                _id: target._id,
                role: "student",
                tokenVersion: target.tokenVersion,
                ...statusFilter,
            },
            {
                $set: { isActive, updatedAt: now },
                $inc: { tokenVersion: 1 },
                $push: {
                    statusHistory: {
                        isActive,
                        changedBy: req.user._id,
                        reason: reason.trim(),
                        changedAt: now,
                    },
                },
            },
            { new: true, runValidators: true }
        ).select("_id name email role isActive");

        if (!updated) {
            return res.status(409).json({
                message: "The account changed while you were updating it. Refresh and try again.",
            });
        }

        return res.json({
            message: `Student account ${isActive ? "reactivated" : "suspended"}.`,
            user: {
                id: updated._id,
                name: updated.name,
                email: updated.email,
                role: updated.role,
                isActive: updated.isActive,
            },
        });
    } catch (error) {
        return next(error);
    }
}

export async function getStudentStatusHistory(req, res, next) {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid user ID." });
    }
    try {
        const user = await User.findOne({
            _id: req.params.id,
            role: "student",
        })
            .select("_id name email +statusHistory")
            .populate("statusHistory.changedBy", "name email")
            .lean();
        if (!user) {
            return res.status(404).json({ message: "Student account not found." });
        }
        return res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
            history: user.statusHistory || [],
        });
    } catch (error) {
        return next(error);
    }
}
