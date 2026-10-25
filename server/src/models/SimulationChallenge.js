import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema(
    {
        technique: { type: Number, required: true, min: 0, max: 4 },
        recording: { type: Number, required: true, min: 0, max: 2 },
        calculation: { type: Number, required: true, min: 0, max: 2 },
        reasoning: { type: Number, required: true, min: 0, max: 2 },
        total: { type: Number, required: true, min: 0, max: 10 },
        maximum: { type: Number, required: true, default: 10 },
    },
    { _id: false }
);

const challengeSchema = new mongoose.Schema(
    {
        code: { type: String, required: true, unique: true, uppercase: true },
        simulation: { type: String, enum: ["ohms-law"], required: true },
        seed: { type: String, required: true, maxlength: 100 },
        creatorScore: { type: scoreSchema, required: true },
        opponentScore: { type: scoreSchema, default: null },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        expiresAt: {
            type: Date,
            required: true,
            default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    },
    { timestamps: true }
);

challengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("SimulationChallenge", challengeSchema);
