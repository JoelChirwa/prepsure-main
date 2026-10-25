import mongoose from "mongoose";

const answerOptionSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },
    },
    { timestamps: false }
);

const questionSchema = new mongoose.Schema(
    {
        prompt: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000,
        },
        options: {
            type: [answerOptionSchema],
            required: true,
            validate: {
                validator: (options) => options.length >= 2 && options.length <= 6,
                message: "Each question must have between 2 and 6 answer options.",
            },
        },
        correctOptionIndex: {
            type: Number,
            required: true,
            min: 0,
            validate: {
                validator(value) {
                    return Number.isInteger(value) && value < this.options.length;
                },
                message: "The correct answer must match one of the question options.",
            },
        },
        explanation: {
            type: String,
            trim: true,
            maxlength: 2000,
            default: "",
        },
        topic: {
            type: String,
            trim: true,
            maxlength: 100,
            default: "",
        },
    },
    { timestamps: false }
);

const quizSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 160,
        },
        subject: {
            type: String,
            required: true,
            trim: true,
            maxlength: 80,
        },
        topic: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        difficulty: {
            type: String,
            required: true,
            enum: ["Beginner", "Intermediate", "Advanced"],
        },
        durationMinutes: {
            type: Number,
            required: true,
            min: 1,
            max: 180,
            validate: Number.isInteger,
        },
        isMockExam: {
            type: Boolean,
            default: false,
        },
        attemptLimit: {
            type: Number,
            min: 1,
            max: 5,
            default: 3,
            validate: Number.isInteger,
        },
        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },
        questions: {
            type: [questionSchema],
            required: true,
            validate: {
                validator: (questions) =>
                    questions.length >= 1 && questions.length <= 50,
                message: "A quiz must contain between 1 and 50 questions.",
            },
        },
        published: {
            type: Boolean,
            default: false,
        },
        retired: {
            type: Boolean,
            default: false,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

quizSchema.index({ published: 1, retired: 1, subject: 1, topic: 1 });

export default mongoose.model("Quiz", quizSchema);
