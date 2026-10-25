import mongoose from "mongoose";

const optionSnapshotSchema = new mongoose.Schema(
    {
        id: { type: mongoose.Schema.Types.ObjectId, required: true },
        text: { type: String, required: true },
    },
    { _id: false }
);

const questionSnapshotSchema = new mongoose.Schema(
    {
        questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
        prompt: { type: String, required: true },
        options: { type: [optionSnapshotSchema], required: true },
        correctOptionId: { type: mongoose.Schema.Types.ObjectId, required: true },
        explanation: { type: String, default: "" },
        topic: { type: String, default: "" },
    },
    { _id: false }
);

const answerSchema = new mongoose.Schema(
    {
        questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
        selectedOptionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    },
    { _id: false }
);

const responseSchema = new mongoose.Schema(
    {
        questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
        prompt: { type: String, required: true },
        options: { type: [optionSnapshotSchema], required: true },
        selectedOptionId: { type: mongoose.Schema.Types.ObjectId, default: null },
        correctOptionId: { type: mongoose.Schema.Types.ObjectId, required: true },
        isCorrect: { type: Boolean, required: true },
        explanation: { type: String, default: "" },
        topic: { type: String, default: "" },
    },
    { _id: false }
);

const mockExamAttemptSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        exam: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quiz",
            required: true,
        },
        examTitle: { type: String, required: true },
        requestId: {
            type: String,
            required: true,
            match: /^[0-9a-f-]{36}$/i,
        },
        attemptNumber: { type: Number, required: true, min: 1 },
        attemptLimit: { type: Number, required: true, min: 1, max: 5 },
        durationMinutes: { type: Number, required: true, min: 1, max: 180 },
        questions: { type: [questionSnapshotSchema], required: true },
        answers: { type: [answerSchema], default: [] },
        revision: { type: Number, default: 0, min: 0 },
        status: {
            type: String,
            enum: ["inProgress", "submitted", "expired"],
            default: "inProgress",
            required: true,
        },
        startedAt: { type: Date, required: true },
        expiresAt: { type: Date, required: true },
        submittedAt: { type: Date, default: null },
        responses: { type: [responseSchema], default: [] },
        score: { type: Number, default: null, min: 0 },
        totalQuestions: { type: Number, required: true, min: 1 },
        percentage: { type: Number, default: null, min: 0, max: 100 },
    },
    { timestamps: true }
);

mockExamAttemptSchema.index(
    { student: 1, exam: 1, requestId: 1 },
    { unique: true }
);
mockExamAttemptSchema.index(
    { student: 1, exam: 1, attemptNumber: 1 },
    { unique: true }
);
mockExamAttemptSchema.index({ student: 1, submittedAt: -1 });
mockExamAttemptSchema.index({ student: 1, exam: 1, status: 1 });

export default mongoose.model("MockExamAttempt", mockExamAttemptSchema);
