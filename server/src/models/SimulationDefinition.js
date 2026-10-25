import mongoose from "mongoose";

const simulationDefinitionSchema = new mongoose.Schema(
    {
        slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
        title: { type: String, required: true, trim: true },
        subject: { type: String, required: true, default: "Physics" },
        status: {
            type: String,
            enum: ["draft", "review", "published"],
            default: "draft",
        },
        skills: { type: [String], default: [] },
        reviewNotes: { type: String, default: "", maxlength: 2000 },
        signedOffBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        signedOffAt: { type: Date, default: null },
    },
    { timestamps: true }
);

export default mongoose.model("SimulationDefinition", simulationDefinitionSchema);
