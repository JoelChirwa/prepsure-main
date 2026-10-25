
import mongoose from "mongoose";

const savedExperimentSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        experiment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Experiment",
            required: true,
        },
    },
    { timestamps: true }
);

// A student can save each experiment only once.
savedExperimentSchema.index(
    { student: 1, experiment: 1 },
    { unique: true }
);

export default mongoose.model("SavedExperiment", savedExperimentSchema);
