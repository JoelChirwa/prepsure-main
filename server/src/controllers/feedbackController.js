import mongoose from "mongoose";
import Feedback from "../models/Feedback.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const feedbackStatuses = ["new", "in_progress", "resolved"];

export async function submitFeedback(req, res, next) {
    try {
        const { category, name, email, subject, message } = req.body;

        if (
            !["question", "feedback"].includes(category) ||
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof subject !== "string" ||
            typeof message !== "string"
        ) {
            return res.status(400).json({
                message: "Complete all fields with valid information.",
            });
        }

        const normalized = {
            category,
            name: name.trim(),
            email: email.trim().toLowerCase(),
            subject: subject.trim(),
            message: message.trim(),
        };

        if (
            normalized.name.length < 2 ||
            normalized.email.length > 254 ||
            !emailPattern.test(normalized.email) ||
            !normalized.subject ||
            !normalized.message
        ) {
            return res.status(400).json({
                message: "Enter a valid name, email, subject, and message.",
            });
        }

        await Feedback.create(normalized);
        return res.status(201).json({
            message: "Thanks for reaching out. Your message has been received.",
        });
    } catch (error) {
        return next(error);
    }
}

export async function listAdminFeedback(req, res, next) {
    try {
        const { status, category, search } = req.query;
        if (status && !feedbackStatuses.includes(status)) {
            return res.status(400).json({ message: "Choose a valid feedback status." });
        }
        if (category && !["question", "feedback"].includes(category)) {
            return res.status(400).json({ message: "Choose a valid feedback category." });
        }
        if (
            search !== undefined &&
            (typeof search !== "string" || search.length > 100)
        ) {
            return res.status(400).json({ message: "Search must be up to 100 characters." });
        }

        const filter = {};
        if (status) filter.status = status;
        if (category) filter.category = category;
        if (search?.trim()) {
            const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const expression = new RegExp(escaped, "i");
            filter.$or = [
                { name: expression },
                { email: expression },
                { subject: expression },
                { message: expression },
            ];
        }

        const parsedPage = Number.parseInt(req.query.page, 10);
        const page = Number.isInteger(parsedPage) && parsedPage > 0
            ? parsedPage
            : 1;
        const limit = 25;
        const [total, feedback] = await Promise.all([
            Feedback.countDocuments(filter),
            Feedback.find(filter)
                .select("-__v")
                .populate("updatedBy", "name email")
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
        ]);
        return res.json({
            feedback,
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

export async function updateAdminFeedback(req, res, next) {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid feedback ID." });
    }

    const { status, resolutionNote } = req.body || {};
    if (
        !feedbackStatuses.includes(status) ||
        (resolutionNote !== undefined && typeof resolutionNote !== "string") ||
        (typeof resolutionNote === "string" && resolutionNote.trim().length > 2000)
    ) {
        return res.status(400).json({
            message: "Provide a valid status and a resolution note of up to 2000 characters.",
        });
    }

    try {
        const update = {
            status,
            updatedBy: req.user._id,
            ...(resolutionNote !== undefined
                ? { resolutionNote: resolutionNote.trim() }
                : {}),
            resolvedAt: status === "resolved" ? new Date() : null,
        };
        const feedback = await Feedback.findByIdAndUpdate(
            req.params.id,
            { $set: update },
            { new: true, runValidators: true }
        ).populate("updatedBy", "name email");

        if (!feedback) {
            return res.status(404).json({ message: "Feedback item not found." });
        }

        return res.json({
            message: "Feedback item updated.",
            feedback,
        });
    } catch (error) {
        return next(error);
    }
}
