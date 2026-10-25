import mongoose from "mongoose";

const readingSchema = new mongoose.Schema(
    {
        current: { type: Number, required: true, min: 0, max: 1000 },
        voltage: { type: Number, required: true, min: 0, max: 1000 },
    },
    { _id: false }
);

const simulationAttemptSchema = new mongoose.Schema(
    {
        clientAttemptId: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        simulation: {
            type: String,
            enum: ["ohms-law"],
            required: true,
        },
        mode: {
            type: String,
            enum: ["guided", "practice", "exam"],
            required: true,
        },
        seed: {
            type: String,
            required: true,
            maxlength: 100,
        },
        readings: {
            type: [readingSchema],
            default: [],
            validate: (readings) => readings.length <= 20,
        },
        technique: {
            connectedAmmeter: Boolean,
            connectedVoltmeter: Boolean,
            correctPolarity: Boolean,
            switchUsed: Boolean,
        },
        labSheet: {
            scale: { type: String, maxlength: 500, default: "" },
            gradient: { type: Number, min: 0, max: 1000, default: null },
            conclusion: { type: String, maxlength: 2000, default: "" },
        },
        score: {
            technique: { type: Number, required: true, min: 0, max: 4 },
            recording: { type: Number, required: true, min: 0, max: 2 },
            calculation: { type: Number, required: true, min: 0, max: 2 },
            reasoning: { type: Number, required: true, min: 0, max: 2 },
            total: { type: Number, required: true, min: 0, max: 10 },
            maximum: { type: Number, required: true, default: 10 },
        },
        submittedAt: {
            type: Date,
            required: true,
            default: Date.now,
        },
    },
    { timestamps: true }
);

simulationAttemptSchema.index(
    { student: 1, clientAttemptId: 1 },
    { unique: true }
);

export default mongoose.model("SimulationAttempt", simulationAttemptSchema);
