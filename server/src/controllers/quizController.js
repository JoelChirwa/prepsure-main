import mongoose from "mongoose";
import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";

const quizFields = [
    "title",
    "subject",
    "topic",
    "difficulty",
    "durationMinutes",
    "isMockExam",
    "attemptLimit",
    "description",
    "questions",
    "published",
];

export function serializeQuiz(quiz, { includeAnswers = false } = {}) {
    const source = typeof quiz.toObject === "function" ? quiz.toObject() : quiz;
    return {
        _id: source._id,
        title: source.title,
        subject: source.subject,
        topic: source.topic,
        difficulty: source.difficulty,
        durationMinutes: source.durationMinutes,
        isMockExam: source.isMockExam || false,
        attemptLimit: source.attemptLimit || 3,
        description: source.description,
        published: source.published,
        retired: source.retired,
        questionCount: source.questions.length,
        ...(source.updatedAt ? { updatedAt: source.updatedAt } : {}),
        ...(includeAnswers
            ? {
                questions: source.questions.map((question) => ({
                    _id: question._id,
                    prompt: question.prompt,
                    options: question.options.map((option) => ({
                        _id: option._id,
                        text: option.text,
                    })),
                    correctOptionIndex: question.correctOptionIndex,
                    explanation: question.explanation,
                    topic: question.topic,
                })),
            }
            : {}),
        ...(!includeAnswers
            ? {
                questions: source.questions.map((question) => ({
                    _id: question._id,
                    prompt: question.prompt,
                    options: question.options.map((option) => ({
                        _id: option._id,
                        text: option.text,
                    })),
                    topic: question.topic,
                })),
            }
            : {}),
    };
}

export function gradeQuiz(quiz, answers) {
    if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
        return { error: "Submit one answer for every question." };
    }

    const answerMap = new Map();
    for (const answer of answers) {
        if (
            !answer ||
            !mongoose.isValidObjectId(answer.questionId) ||
            !mongoose.isValidObjectId(answer.selectedOptionId) ||
            answerMap.has(String(answer.questionId))
        ) {
            return { error: "One or more submitted answers are invalid." };
        }

        answerMap.set(String(answer.questionId), String(answer.selectedOptionId));
    }

    const questionIds = new Set(quiz.questions.map((question) => String(question._id)));
    if ([...answerMap.keys()].some((questionId) => !questionIds.has(questionId))) {
        return { error: "Answers must belong to this quiz." };
    }

    const responses = [];
    let score = 0;

    for (const question of quiz.questions) {
        const questionId = String(question._id);
        const selectedOptionId = answerMap.get(questionId);
        const selectedOption = question.options.find(
            (option) => String(option._id) === selectedOptionId
        );
        const correctOption = question.options[question.correctOptionIndex];

        if (!selectedOption || !correctOption) {
            return { error: "One or more selected options are invalid." };
        }

        const isCorrect = String(correctOption._id) === selectedOptionId;
        if (isCorrect) score += 1;

        responses.push({
            questionId: question._id,
            prompt: question.prompt,
            options: question.options.map((option) => ({
                id: option._id,
                text: option.text,
            })),
            selectedOptionId: selectedOption._id,
            correctOptionId: correctOption._id,
            isCorrect,
            explanation: question.explanation,
            topic: question.topic || quiz.topic,
        });
    }

    return {
        responses,
        score,
        totalQuestions: quiz.questions.length,
        percentage: Math.round((score / quiz.questions.length) * 100),
    };
}

function pickQuizFields(body) {
    return Object.fromEntries(
        quizFields
            .filter((field) => body[field] !== undefined)
            .map((field) => [field, body[field]])
    );
}

export function validateQuizPayload(body, { partial = false } = {}) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return "Provide quiz details.";
    }

    const data = pickQuizFields(body);
    const requiredFields = [
        "title",
        "subject",
        "topic",
        "difficulty",
        "durationMinutes",
        "description",
        "questions",
    ];
    if (!partial && requiredFields.some((field) => data[field] === undefined)) {
        return "Complete all required quiz details and add at least one question.";
    }
    if (partial && !Object.keys(data).length) {
        return "Provide at least one quiz field to update.";
    }
    if (data.questions !== undefined) {
        if (
            !Array.isArray(data.questions) ||
            data.questions.length < 1 ||
            data.questions.length > 50
        ) {
            return "A quiz must contain between 1 and 50 questions.";
        }

        for (const question of data.questions) {
            if (
                !question ||
                typeof question.prompt !== "string" ||
                !question.prompt.trim() ||
                !Array.isArray(question.options) ||
                question.options.length < 2 ||
                question.options.length > 6 ||
                question.options.some(
                    (option) =>
                        !option ||
                        typeof option.text !== "string" ||
                        !option.text.trim()
                ) ||
                !Number.isInteger(question.correctOptionIndex) ||
                question.correctOptionIndex < 0 ||
                question.correctOptionIndex >= question.options.length ||
                (question.explanation !== undefined &&
                    typeof question.explanation !== "string") ||
                (question.topic !== undefined &&
                    typeof question.topic !== "string")
            ) {
                return "Each question needs a prompt, 2–6 options, a valid correct answer, and text feedback.";
            }
        }
    }

    if (
        data.title !== undefined &&
        (typeof data.title !== "string" ||
            !data.title.trim() ||
            data.title.trim().length > 160)
    ) {
        return "Quiz title must be between 1 and 160 characters.";
    }
    if (
        data.subject !== undefined &&
        (typeof data.subject !== "string" ||
            !data.subject.trim() ||
            data.subject.trim().length > 80)
    ) {
        return "Enter a valid quiz subject.";
    }
    if (
        data.topic !== undefined &&
        (typeof data.topic !== "string" ||
            !data.topic.trim() ||
            data.topic.trim().length > 100)
    ) {
        return "Enter a valid quiz topic.";
    }
    if (
        data.difficulty !== undefined &&
        !["Beginner", "Intermediate", "Advanced"].includes(data.difficulty)
    ) {
        return "Choose a valid quiz difficulty.";
    }
    if (
        data.durationMinutes !== undefined &&
        (!Number.isInteger(data.durationMinutes) ||
            data.durationMinutes < 1 ||
            data.durationMinutes > 180)
    ) {
        return "Quiz duration must be between 1 and 180 minutes.";
    }
    if (
        data.isMockExam !== undefined &&
        typeof data.isMockExam !== "boolean"
    ) {
        return "Mock exam status must be true or false.";
    }
    if (
        data.attemptLimit !== undefined &&
        (!Number.isInteger(data.attemptLimit) ||
            data.attemptLimit < 1 ||
            data.attemptLimit > 5)
    ) {
        return "Attempt limit must be between 1 and 5.";
    }
    if (
        data.description !== undefined &&
        (typeof data.description !== "string" ||
            !data.description.trim() ||
            data.description.trim().length > 1000)
    ) {
        return "Enter a quiz description of up to 1000 characters.";
    }
    if (
        data.published !== undefined &&
        typeof data.published !== "boolean"
    ) {
        return "Published status must be true or false.";
    }

    return null;
}

function sendQuizValidationError(error, res, next) {
    if (error.name === "ValidationError" || error.name === "CastError") {
        return res.status(400).json({ message: error.message });
    }

    return next(error);
}

export async function listAdminQuizzes(req, res, next) {
    try {
        const filter = req.query.includeRetired === "true"
            ? {}
            : { retired: false };
        const quizzes = await Quiz.find(filter).sort({ updatedAt: -1 }).lean();
        return res.json({ quizzes: quizzes.map((quiz) => serializeQuiz(quiz, {
            includeAnswers: true,
        })) });
    } catch (error) {
        return next(error);
    }
}

export async function getAdminQuiz(req, res, next) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid quiz ID." });
        }
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found." });
        }
        return res.json({ quiz: serializeQuiz(quiz, { includeAnswers: true }) });
    } catch (error) {
        return next(error);
    }
}

export async function createQuiz(req, res, next) {
    const validationError = validateQuizPayload(req.body);
    if (validationError) {
        return res.status(400).json({ message: validationError });
    }

    try {
        const quiz = await Quiz.create({
            ...pickQuizFields(req.body),
            createdBy: req.user._id,
        });
        return res.status(201).json({
            message: "Quiz created.",
            quiz: serializeQuiz(quiz, { includeAnswers: true }),
        });
    } catch (error) {
        return sendQuizValidationError(error, res, next);
    }
}

export async function updateQuiz(req, res, next) {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid quiz ID." });
    }
    const validationError = validateQuizPayload(req.body, { partial: true });
    if (validationError) {
        return res.status(400).json({ message: validationError });
    }

    try {
        const quiz = await Quiz.findOneAndUpdate(
            { _id: req.params.id, retired: false },
            { $set: pickQuizFields(req.body) },
            { new: true, runValidators: true }
        );
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found." });
        }
        return res.json({
            message: "Quiz updated.",
            quiz: serializeQuiz(quiz, { includeAnswers: true }),
        });
    } catch (error) {
        return sendQuizValidationError(error, res, next);
    }
}

export async function retireQuiz(req, res, next) {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid quiz ID." });
    }
    try {
        const quiz = await Quiz.findOneAndUpdate(
            { _id: req.params.id, retired: false },
            { $set: { retired: true, published: false } },
            { new: true }
        );
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found." });
        }
        return res.json({ message: "Quiz retired." });
    } catch (error) {
        return next(error);
    }
}

export async function listPublishedQuizzes(req, res, next) {
    try {
        const { subject, topic, difficulty } = req.query;
        const filter = { published: true, retired: false, isMockExam: false };
        if (subject && subject !== "All") filter.subject = subject;
        if (topic) filter.topic = topic;
        if (difficulty) filter.difficulty = difficulty;
        const quizzes = await Quiz.find(filter)
            .select("-questions.correctOptionIndex -questions.explanation")
            .sort({ updatedAt: -1 })
            .lean();
        return res.json({
            quizzes: quizzes.map((quiz) => serializeQuiz(quiz)),
        });
    } catch (error) {
        return next(error);
    }
}

export async function getPublishedQuiz(req, res, next) {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid quiz ID." });
    }
    try {
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            published: true,
            retired: false,
            isMockExam: false,
        }).select("-questions.correctOptionIndex -questions.explanation");
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found." });
        }
        return res.json({ quiz: serializeQuiz(quiz) });
    } catch (error) {
        return next(error);
    }
}

export async function submitQuizAttempt(req, res, next) {
    const { requestId, answers } = req.body || {};
    if (
        typeof requestId !== "string" ||
        !/^[0-9a-f-]{36}$/i.test(requestId)
    ) {
        return res.status(400).json({ message: "A valid attempt ID is required." });
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid quiz ID." });
    }

    try {
        const existingAttempt = await QuizAttempt.findOne({
            student: req.user._id,
            quiz: req.params.id,
            requestId,
        });
        if (existingAttempt) {
            return res.json({
                message: "Quiz attempt already submitted.",
                attempt: existingAttempt,
            });
        }

        const quiz = await Quiz.findOne({
            _id: req.params.id,
            published: true,
            retired: false,
        });
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found." });
        }

        const result = gradeQuiz(quiz, answers);
        if (result.error) {
            return res.status(400).json({ message: result.error });
        }

        const attemptData = {
            student: req.user._id,
            quiz: quiz._id,
            quizTitle: quiz.title,
            requestId,
            ...result,
        };
        try {
            const attempt = await QuizAttempt.create(attemptData);
            return res.status(201).json({ message: "Quiz submitted.", attempt });
        } catch (error) {
            if (error.code !== 11000) throw error;
            const attempt = await QuizAttempt.findOne({
                student: req.user._id,
                quiz: quiz._id,
                requestId,
            });
            if (!attempt) throw error;
            return res.json({
                message: "Quiz attempt already submitted.",
                attempt,
            });
        }
    } catch (error) {
        return next(error);
    }
}

export async function listStudentAttempts(req, res, next) {
    try {
        const attempts = await QuizAttempt.find({ student: req.user._id })
            .select("quiz quizTitle score totalQuestions percentage submittedAt")
            .sort({ submittedAt: -1 })
            .limit(50)
            .lean();
        return res.json({ attempts });
    } catch (error) {
        return next(error);
    }
}

export async function getStudentAttempt(req, res, next) {
    if (!mongoose.isValidObjectId(req.params.attemptId)) {
        return res.status(400).json({ message: "Invalid attempt ID." });
    }
    try {
        const attempt = await QuizAttempt.findOne({
            _id: req.params.attemptId,
            student: req.user._id,
        }).lean();
        if (!attempt) {
            return res.status(404).json({ message: "Quiz attempt not found." });
        }
        return res.json({ attempt });
    } catch (error) {
        return next(error);
    }
}
