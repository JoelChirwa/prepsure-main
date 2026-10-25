import mongoose from "mongoose";
import Experiment from "../models/Experiment.js";
import {
    isMediaStorageConfigured,
    uploadExperimentImage,
} from "../services/media.js";

const allowedFields = [
    "slug",
    "title",
    "category",
    "difficulty",
    "duration",
    "summary",
    "theory",
    "apparatusImages",
    "objectives",
    "apparatus",
    "procedure",
    "observations",
    "conclusion",
    "safety",
    "published",
];

function pickAllowedFields(body) {
    return Object.fromEntries(
        allowedFields
            .filter((field) => body[field] !== undefined)
            .map((field) => [field, body[field]])
    );
}

function validateExperimentFields(data) {
    if (data.theory !== undefined && typeof data.theory !== "string") {
        return "Theory must be text.";
    }

    if (data.apparatusImages !== undefined) {
        if (
            !Array.isArray(data.apparatusImages) ||
            data.apparatusImages.length > 20 ||
            data.apparatusImages.some((image) => {
                if (typeof image !== "string" || image.length > 2048) {
                    return true;
                }

                try {
                    const url = new URL(image);
                    return !["https:", "http:"].includes(url.protocol);
                } catch {
                    return true;
                }
            })
        ) {
            return "Apparatus images must be valid HTTP(S) URLs (up to 20).";
        }
    }

    return null;
}

function createSearchFilter(search) {
    if (!search?.trim()) {
        return {};
    }

    const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedSearch, "i");

    return {
        $or: [
            { title: regex },
            { category: regex },
            { summary: regex },
            { apparatus: regex },
        ],
    };
}

function createExperimentQuery(id) {
    return mongoose.isValidObjectId(id)
        ? { $or: [{ _id: id }, { slug: id }] }
        : { slug: id };
}

export async function listExperiments(req, res, next) {
    try {
        const { search, category, difficulty } = req.query;

        if (search !== undefined && typeof search !== "string") {
            return res.status(400).json({
                message: "Search must be a single text value.",
            });
        }

        const filter = { published: true };

        if (category && category !== "All categories") {
            filter.category = category;
        }

        if (difficulty && difficulty !== "All levels") {
            filter.difficulty = difficulty;
        }

        Object.assign(filter, createSearchFilter(search));

        const experiments = await Experiment.find(filter)
            .sort({ title: 1 })
            .lean();

        return res.json({
            count: experiments.length,
            experiments,
        });
    } catch (error) {
        return next(error);
    }
}

export async function listAdminExperiments(req, res, next) {
    try {
        if (
            req.query.search !== undefined &&
            typeof req.query.search !== "string"
        ) {
            return res.status(400).json({
                message: "Search must be a single text value.",
            });
        }

        const experiments = await Experiment.find(
            createSearchFilter(req.query.search)
        )
            .sort({ title: 1 })
            .lean();

        return res.json({
            count: experiments.length,
            experiments,
        });
    } catch (error) {
        return next(error);
    }
}

export async function uploadApparatusImage(req, res, next) {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Choose an apparatus image to upload.",
            });
        }

        if (!isMediaStorageConfigured()) {
            return res.status(503).json({
                message: "Apparatus image storage is not configured.",
            });
        }

        const url = await uploadExperimentImage(req.file.buffer);
        return res.status(201).json({ url });
    } catch (error) {
        return next(error);
    }
}

export async function getExperiment(req, res, next) {
    try {
        const experiment = await Experiment.findOne({
            ...createExperimentQuery(req.params.id),
            published: true,
        }).lean();

        if (!experiment) {
            return res.status(404).json({ message: "Experiment not found." });
        }

        return res.json({ experiment });
    } catch (error) {
        return next(error);
    }
}

export async function createExperiment(req, res, next) {
    try {
        const data = pickAllowedFields(req.body);
        const validationError = validateExperimentFields(data);
        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        const experiment = await Experiment.create(data);
        return res.status(201).json({
            message: "Experiment created.",
            experiment,
        });
    } catch (error) {
        return next(error);
    }
}

export async function updateExperiment(req, res, next) {
    try {
        const data = pickAllowedFields(req.body);
        const validationError = validateExperimentFields(data);
        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        const experiment = await Experiment.findOneAndUpdate(
            createExperimentQuery(req.params.id),
            { $set: data },
            { returnDocument: "after", runValidators: true }
        );

        if (!experiment) {
            return res.status(404).json({ message: "Experiment not found." });
        }

        return res.json({ message: "Experiment updated.", experiment });
    } catch (error) {
        return next(error);
    }
}

export async function deleteExperiment(req, res, next) {
    try {
        const experiment = await Experiment.findOneAndDelete(
            createExperimentQuery(req.params.id)
        );

        if (!experiment) {
            return res.status(404).json({ message: "Experiment not found." });
        }

        return res.json({ message: "Experiment deleted." });
    } catch (error) {
        return next(error);
    }
}
