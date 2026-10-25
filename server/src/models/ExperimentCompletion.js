import mongoose from "mongoose";

const experimentCompletionSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        experiment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Experiment",
            required: true,
        },
    },
    { timestamps: true }
);

experimentCompletionSchema.index(
    { student: 1, experiment: 1 },
    { unique: true }
);

export default mongoose.model(
    "ExperimentCompletion",
    experimentCompletionSchema
);
