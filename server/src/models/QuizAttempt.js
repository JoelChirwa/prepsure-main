import mongoose from "mongoose";

const responseSchema = new mongoose.Schema(
    {
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        prompt: {
            type: String,
            required: true,
        },
        options: {
            type: [{
                id: mongoose.Schema.Types.ObjectId,
                text: String,
            }],
            required: true,
        },
        selectedOptionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        correctOptionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        isCorrect: {
            type: Boolean,
            required: true,
        },
        explanation: {
            type: String,
            default: "",
        },
        topic: {
            type: String,
            default: "",
        },
    },
    { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        quiz: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quiz",
            required: true,
        },
        quizTitle: {
            type: String,
            required: true,
        },
        requestId: {
            type: String,
            required: true,
            match: /^[0-9a-f-]{36}$/i,
        },
        responses: {
            type: [responseSchema],
            required: true,
        },
        score: {
            type: Number,
            required: true,
            min: 0,
        },
        totalQuestions: {
            type: Number,
            required: true,
            min: 1,
        },
        percentage: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        submittedAt: {
            type: Date,
            required: true,
            default: Date.now,
        },
    },
    { timestamps: true }
);

quizAttemptSchema.index({ student: 1, quiz: 1, requestId: 1 }, { unique: true });
quizAttemptSchema.index({ student: 1, submittedAt: -1 });

export default mongoose.model("QuizAttempt", quizAttemptSchema);
