import mongoose from "mongoose";
import MockExamAttempt from "../models/MockExamAttempt.js";
import Quiz from "../models/Quiz.js";

export function gradeMockExam(attempt) {
    const selected = new Map(
        attempt.answers.map((answer) => [
            String(answer.questionId),
            String(answer.selectedOptionId),
        ])
    );
    let score = 0;
    const responses = attempt.questions.map((question) => {
        const selectedOptionId = selected.get(String(question.questionId)) || null;
        const isCorrect = selectedOptionId !== null &&
            selectedOptionId === String(question.correctOptionId);
        if (isCorrect) score += 1;
        return {
            questionId: question.questionId,
            prompt: question.prompt,
            options: question.options,
            selectedOptionId,
            correctOptionId: question.correctOptionId,
            isCorrect,
            explanation: question.explanation,
            topic: question.topic,
        };
    });
    return {
        responses,
        score,
        totalQuestions: attempt.questions.length,
        percentage: Math.round((score / attempt.questions.length) * 100),
    };
}

export function serializeMockExamAttempt(attempt, now = Date.now()) {
    const source = typeof attempt.toObject === "function"
        ? attempt.toObject()
        : attempt;
    const result = {
        _id: source._id,
        exam: source.exam,
        examTitle: source.examTitle,
        attemptNumber: source.attemptNumber,
        attemptLimit: source.attemptLimit,
        durationMinutes: source.durationMinutes,
        status: source.status,
        startedAt: source.startedAt,
        expiresAt: source.expiresAt,
        submittedAt: source.submittedAt,
        totalQuestions: source.totalQuestions,
        answers: source.answers.map((answer) => ({
            questionId: answer.questionId,
            selectedOptionId: answer.selectedOptionId,
        })),
    };

    if (source.status !== "inProgress") {
        return {
            ...result,
            responses: source.responses,
            score: source.score,
            percentage: source.percentage,
        };
    }

    return {
        ...result,
        timeRemainingMs: Math.max(
            0,
            new Date(source.expiresAt).getTime() - now
        ),
        questions: source.questions.map((question) => ({
            _id: question.questionId,
            prompt: question.prompt,
            options: question.options,
            topic: question.topic,
        })),
    };
}

async function finishAttempt(attemptId, status, submittedAt) {
    for (;;) {
        const attempt = await MockExamAttempt.findById(attemptId);
        if (!attempt) return null;
        if (attempt.status !== "inProgress") return attempt;

        const report = gradeMockExam(attempt);
        const finished = await MockExamAttempt.findOneAndUpdate(
            {
                _id: attemptId,
                status: "inProgress",
                revision: attempt.revision,
            },
            {
                $set: {
                    ...report,
                    status,
                    submittedAt,
                },
            },
            { new: true, runValidators: true }
        );
        if (finished) return finished;
    }
}

async function finishIfExpired(attempt) {
    if (
        attempt.status === "inProgress" &&
        new Date(attempt.expiresAt).getTime() <= Date.now()
    ) {
        return finishAttempt(
            attempt._id,
            "expired",
            attempt.expiresAt
        );
    }
    return attempt;
}

export async function listMockExams(req, res, next) {
    try {
        const exams = await Quiz.find({
            published: true,
            retired: false,
            isMockExam: true,
        })
            .select("title subject topic difficulty durationMinutes description attemptLimit")
            .sort({ updatedAt: -1 })
            .lean();
        const attempts = exams.length
            ? await MockExamAttempt.find({
                student: req.user._id,
                exam: { $in: exams.map(({ _id }) => _id) },
            })
                .select("exam attemptNumber attemptLimit status expiresAt percentage")
                .sort({ attemptNumber: -1 })
                .lean()
            : [];
        const byExam = new Map();
        for (const attempt of attempts) {
            const key = String(attempt.exam);
            const summary = byExam.get(key) || {
                attemptsUsed: 0,
                activeAttempt: null,
                latestAttempt: null,
            };
            summary.attemptsUsed += 1;
            if (attempt.status === "inProgress" && !summary.activeAttempt) {
                summary.activeAttempt = attempt;
            }
            if (!summary.latestAttempt) summary.latestAttempt = attempt;
            byExam.set(key, summary);
        }

        return res.json({
            exams: exams.map((exam) => {
                const summary = byExam.get(String(exam._id)) || {
                    attemptsUsed: 0,
                    activeAttempt: null,
                    latestAttempt: null,
                };
                const attemptLimit = exam.attemptLimit || 3;
                return {
                    ...exam,
                    attemptsUsed: summary.attemptsUsed,
                    attemptsRemaining: Math.max(
                        0,
                        attemptLimit - summary.attemptsUsed
                    ),
                    attemptLimit,
                    activeAttemptId: summary.activeAttempt?._id || null,
                    activeExpiresAt: summary.activeAttempt?.expiresAt || null,
                    latestAttemptId: summary.latestAttempt?._id || null,
                    latestAttemptStatus: summary.latestAttempt?.status || null,
                    latestAttemptPercentage: summary.latestAttempt?.percentage ?? null,
                };
            }),
        });
    } catch (error) {
        return next(error);
    }
}

export async function startMockExam(req, res, next) {
    const { requestId } = req.body || {};
    if (typeof requestId !== "string" || !/^[0-9a-f-]{36}$/i.test(requestId)) {
        return res.status(400).json({ message: "A valid attempt ID is required." });
    }
    if (!mongoose.isValidObjectId(req.params.examId)) {
        return res.status(400).json({ message: "Invalid mock exam ID." });
    }

    try {
        const existing = await MockExamAttempt.findOne({
            student: req.user._id,
            exam: req.params.examId,
            requestId,
        });
        if (existing) {
            const current = await finishIfExpired(existing);
            return res.json({ attempt: serializeMockExamAttempt(current) });
        }

        const exam = await Quiz.findOne({
            _id: req.params.examId,
            published: true,
            retired: false,
            isMockExam: true,
        });
        if (!exam) {
            return res.status(404).json({ message: "Mock exam not found." });
        }

        const activeAttempt = await MockExamAttempt.findOne({
            student: req.user._id,
            exam: exam._id,
            status: "inProgress",
        }).sort({ attemptNumber: -1 });
        if (activeAttempt) {
            const current = await finishIfExpired(activeAttempt);
            if (current.status === "inProgress") {
                return res.json({ attempt: serializeMockExamAttempt(current) });
            }
        }

        const attemptsUsed = await MockExamAttempt.countDocuments({
            student: req.user._id,
            exam: exam._id,
        });
        if (attemptsUsed >= exam.attemptLimit) {
            return res.status(409).json({
                message: "You have used all attempts for this mock exam.",
            });
        }

        const startedAt = new Date();
        const durationMs = exam.durationMinutes * 60 * 1000;
        const questions = exam.questions.map((question) => ({
            questionId: question._id,
            prompt: question.prompt,
            options: question.options.map((option) => ({
                id: option._id,
                text: option.text,
            })),
            correctOptionId: question.options[question.correctOptionIndex]._id,
            explanation: question.explanation,
            topic: question.topic || exam.topic,
        }));
        const attempt = await MockExamAttempt.create({
            student: req.user._id,
            exam: exam._id,
            examTitle: exam.title,
            requestId,
            attemptNumber: attemptsUsed + 1,
            attemptLimit: exam.attemptLimit,
            durationMinutes: exam.durationMinutes,
            questions,
            totalQuestions: questions.length,
            startedAt,
            expiresAt: new Date(startedAt.getTime() + durationMs),
        });

        return res.status(201).json({
            message: "Mock exam started.",
            attempt: serializeMockExamAttempt(attempt),
        });
    } catch (error) {
        if (error.code === 11000) {
            const existing = await MockExamAttempt.findOne({
                student: req.user._id,
                exam: req.params.examId,
                requestId,
            });
            if (existing) {
                const current = await finishIfExpired(existing);
                return res.json({ attempt: serializeMockExamAttempt(current) });
            }
            return res.status(409).json({
                message: "Could not start another attempt. Refresh the mock exam list.",
            });
        }
        return next(error);
    }
}

export async function getMockExamAttempt(req, res, next) {
    if (!mongoose.isValidObjectId(req.params.attemptId)) {
        return res.status(400).json({ message: "Invalid attempt ID." });
    }
    try {
        let attempt = await MockExamAttempt.findOne({
            _id: req.params.attemptId,
            student: req.user._id,
        });
        if (!attempt) {
            return res.status(404).json({ message: "Mock exam attempt not found." });
        }
        attempt = await finishIfExpired(attempt);
        return res.json({ attempt: serializeMockExamAttempt(attempt) });
    } catch (error) {
        return next(error);
    }
}

export async function saveMockExamAnswer(req, res, next) {
    const { questionId, selectedOptionId } = req.body || {};
    if (
        !mongoose.isValidObjectId(req.params.attemptId) ||
        !mongoose.isValidObjectId(questionId) ||
        !mongoose.isValidObjectId(selectedOptionId)
    ) {
        return res.status(400).json({ message: "Choose a valid answer for this attempt." });
    }

    try {
        let attempt = await MockExamAttempt.findOne({
            _id: req.params.attemptId,
            student: req.user._id,
        });
        if (!attempt) {
            return res.status(404).json({ message: "Mock exam attempt not found." });
        }
        attempt = await finishIfExpired(attempt);
        if (attempt.status !== "inProgress") {
            return res.status(409).json({
                message: "This mock exam is no longer accepting answers.",
                attempt: serializeMockExamAttempt(attempt),
            });
        }
        const question = attempt.questions.find(
            (item) => String(item.questionId) === String(questionId)
        );
        if (
            !question ||
            !question.options.some(
                (option) => String(option.id) === String(selectedOptionId)
            )
        ) {
            return res.status(400).json({
                message: "The selected option does not belong to this exam question.",
            });
        }

        const updateResult = await MockExamAttempt.updateOne(
            {
                _id: attempt._id,
                student: req.user._id,
                status: "inProgress",
                expiresAt: { $gt: new Date() },
            },
            [
                {
                    $set: {
                        answers: {
                            $concatArrays: [
                                {
                                    $filter: {
                                        input: "$answers",
                                        as: "answer",
                                        cond: {
                                            $ne: [
                                                "$$answer.questionId",
                                                { $literal: question.questionId },
                                            ],
                                        },
                                    },
                                },
                                {
                                    $literal: [{
                                        questionId: question.questionId,
                                        selectedOptionId: new mongoose.Types.ObjectId(
                                            selectedOptionId
                                        ),
                                    }],
                                },
                            ],
                        },
                        revision: { $add: ["$revision", 1] },
                    },
                },
            ]
        );

        if (updateResult.modifiedCount !== 1) {
            attempt = await MockExamAttempt.findById(attempt._id);
            if (
                attempt?.status === "inProgress" &&
                new Date(attempt.expiresAt).getTime() <= Date.now()
            ) {
                attempt = await finishAttempt(
                    attempt._id,
                    "expired",
                    attempt.expiresAt
                );
            }
            if (!attempt) {
                return res.status(404).json({
                    message: "Mock exam attempt not found.",
                });
            }
            return res.status(409).json({
                message: attempt.status === "expired"
                    ? "Time has expired; your saved answers have been submitted."
                    : "This mock exam is no longer accepting answers.",
                attempt: serializeMockExamAttempt(attempt),
            });
        }

        attempt = await MockExamAttempt.findById(attempt._id);
        return res.json({ attempt: serializeMockExamAttempt(attempt) });
    } catch (error) {
        return next(error);
    }
}

export async function submitMockExam(req, res, next) {
    if (!mongoose.isValidObjectId(req.params.attemptId)) {
        return res.status(400).json({ message: "Invalid attempt ID." });
    }
    try {
        let attempt = await MockExamAttempt.findOne({
            _id: req.params.attemptId,
            student: req.user._id,
        });
        if (!attempt) {
            return res.status(404).json({ message: "Mock exam attempt not found." });
        }
        attempt = await finishIfExpired(attempt);
        if (attempt.status === "inProgress") {
            attempt = await finishAttempt(attempt._id, "submitted", new Date());
        }
        return res.json({
            message: attempt.status === "expired"
                ? "Time expired. Your saved answers were submitted."
                : "Mock exam submitted.",
            attempt: serializeMockExamAttempt(attempt),
        });
    } catch (error) {
        return next(error);
    }
}
