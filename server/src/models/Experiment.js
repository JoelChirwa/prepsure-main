
import mongoose from "mongoose";

const observationSchema = new mongoose.Schema(
    {
        test: {
            type: String,
            required: true,
            trim: true,
        },
        result: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { _id: false }
);

const experimentSchema = new mongoose.Schema(
    {
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            required: true,
            trim: true,
        },
        difficulty: {
            type: String,
            required: true,
            enum: ["Beginner", "Intermediate", "Advanced"],
        },
        duration: {
            type: String,
            required: true,
            trim: true,
        },
        summary: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },
        theory: {
            type: String,
            default: "",
            trim: true,
            maxlength: 10000,
        },
        apparatusImages: {
            type: [{
                type: String,
                trim: true,
                maxlength: 2048,
            }],
            default: [],
        },
        objectives: {
            type: [String],
            default: [],
        },
        apparatus: {
            type: [String],
            default: [],
        },
        procedure: {
            type: [String],
            default: [],
        },
        observations: {
            type: [observationSchema],
            default: [],
        },
        conclusion: {
            type: String,
            default: "",
            trim: true,
        },
        safety: {
            type: [String],
            default: [],
        },
        published: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Experiment", experimentSchema);
