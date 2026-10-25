import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
    {
        category: {
            type: String,
            enum: ["question", "feedback"],
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            maxlength: 254,
        },
        subject: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
        },
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 3000,
        },
        status: {
            type: String,
            enum: ["new", "in_progress", "resolved"],
            default: "new",
            required: true,
        },
        resolutionNote: {
            type: String,
            trim: true,
            maxlength: 2000,
            default: "",
        },
        resolvedAt: {
            type: Date,
            default: null,
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    { timestamps: true }
);

feedbackSchema.index({ status: 1, createdAt: -1 });
feedbackSchema.index({ category: 1, createdAt: -1 });

export default mongoose.model("Feedback", feedbackSchema);
