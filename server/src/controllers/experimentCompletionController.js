import mongoose from "mongoose";
import Experiment from "../models/Experiment.js";
import ExperimentCompletion from "../models/ExperimentCompletion.js";

export async function getCompletionCount(req, res, next) {
    try {
        const count = await ExperimentCompletion.countDocuments({
            student: req.user._id,
        });

        return res.json({ count });
    } catch (error) {
        return next(error);
    }
}

export async function getExperimentCompletion(req, res, next) {
    try {
        const { experimentId } = req.params;

        if (!mongoose.isValidObjectId(experimentId)) {
            return res.status(400).json({ message: "Invalid experiment ID." });
        }

        const experiment = await Experiment.findOne({
            _id: experimentId,
            published: true,
        }).select("_id");

        if (!experiment) {
            return res.status(404).json({ message: "Experiment not found." });
        }

        const completion = await ExperimentCompletion.findOne({
            student: req.user._id,
            experiment: experiment._id,
        }).select("createdAt");

        return res.json({
            completed: Boolean(completion),
            completedAt: completion?.createdAt || null,
        });
    } catch (error) {
        return next(error);
    }
}

export async function markExperimentComplete(req, res, next) {
    try {
        const { experimentId } = req.params;

        if (!mongoose.isValidObjectId(experimentId)) {
            return res.status(400).json({ message: "Invalid experiment ID." });
        }

        const experiment = await Experiment.findOne({
            _id: experimentId,
            published: true,
        }).select("_id");

        if (!experiment) {
            return res.status(404).json({ message: "Experiment not found." });
        }

        const completion = await ExperimentCompletion.findOneAndUpdate(
            {
                student: req.user._id,
                experiment: experiment._id,
            },
            {
                $setOnInsert: {
                    student: req.user._id,
                    experiment: experiment._id,
                },
            },
            {
                upsert: true,
                returnDocument: "after",
                runValidators: true,
            }
        );

        return res.status(200).json({
            message: "Experiment marked as completed.",
            completion: {
                completed: true,
                completedAt: completion.createdAt,
            },
        });
    } catch (error) {
        if (error.code === 11000) {
            try {
                const completion = await ExperimentCompletion.findOne({
                    student: req.user._id,
                    experiment: req.params.experimentId,
                }).select("createdAt");

                if (completion) {
                    return res.status(200).json({
                        message: "Experiment was already completed.",
                        completion: {
                            completed: true,
                            completedAt: completion.createdAt,
                        },
                    });
                }
            } catch (lookupError) {
                return next(lookupError);
            }
        }

        return next(error);
    }
}
