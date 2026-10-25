import mongoose from "mongoose";
import SavedExperiment from "../models/SavedExperiment.js";
import Experiment from "../models/Experiment.js";

export async function listSavedExperiments(req, res, next) {
    try {
        const saved = await SavedExperiment.find({
            student: req.user._id,
        })
            .populate({
                path: "experiment",
                match: { published: true },
            })
            .sort({ createdAt: -1 });

        const experiments = saved
            .filter((item) => item.experiment)
            .map((item) => ({
                savedId: item._id,
                savedAt: item.createdAt,
                experiment: item.experiment,
            }));

        return res.json({ experiments });
    } catch (error) {
        return next(error);
    }
}

export async function saveExperiment(req, res, next) {
    try {
        const { experimentId } = req.params;

        if (!mongoose.isValidObjectId(experimentId)) {
            return res.status(400).json({ message: "Invalid experiment ID." });
        }

        const experiment = await Experiment.findOne({
            _id: experimentId,
            published: true,
        });

        if (!experiment) {
            return res.status(404).json({ message: "Experiment not found." });
        }

        const saved = await SavedExperiment.findOneAndUpdate(
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
            message: "Experiment saved successfully.",
            savedId: saved._id,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(200).json({
                message: "Experiment is already saved.",
            });
        }

        return next(error);
    }
}

export async function removeSavedExperiment(req, res, next) {
    try {
        const { experimentId } = req.params;

        if (!mongoose.isValidObjectId(experimentId)) {
            return res.status(400).json({ message: "Invalid experiment ID." });
        }

        const deleted = await SavedExperiment.findOneAndDelete({
            student: req.user._id,
            experiment: experimentId,
        });

        if (!deleted) {
            return res.status(404).json({
                message: "This experiment is not in your saved list.",
            });
        }

        return res.json({ message: "Experiment removed from saved list." });
    } catch (error) {
        return next(error);
    }
}
