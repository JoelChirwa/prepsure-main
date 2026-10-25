import assert from "node:assert/strict";
import test from "node:test";
import mongoose from "mongoose";
import MockExamAttempt from "../src/models/MockExamAttempt.js";
import Quiz from "../src/models/Quiz.js";
import {
    gradeMockExam,
    serializeMockExamAttempt,
} from "../src/controllers/mockExamController.js";

function createAttempt() {
    const questionId = new mongoose.Types.ObjectId();
    const correctOptionId = new mongoose.Types.ObjectId();
    const wrongOptionId = new mongoose.Types.ObjectId();
    return new MockExamAttempt({
        student: new mongoose.Types.ObjectId(),
        exam: new mongoose.Types.ObjectId(),
        examTitle: "Chemistry practical",
        requestId: "1d83a72c-d46e-4720-a733-c0bb93882ff0",
        attemptNumber: 1,
        attemptLimit: 2,
        durationMinutes: 30,
        totalQuestions: 1,
        startedAt: new Date("2026-01-01T10:00:00.000Z"),
        expiresAt: new Date("2026-01-01T10:30:00.000Z"),
        questions: [{
            questionId,
            prompt: "Which apparatus is used to measure a fixed volume?",
            options: [
                { id: correctOptionId, text: "Pipette" },
                { id: wrongOptionId, text: "Beaker" },
            ],
            correctOptionId,
            explanation: "A pipette delivers a fixed volume accurately.",
            topic: "Apparatus",
        }],
    });
}

test("mock exam attempts require a server-owned deadline, question snapshot, and limit", async () => {
    const attempt = createAttempt();
    await attempt.validate();
    assert.equal(attempt.status, "inProgress");
    assert.equal(attempt.revision, 0);
    assert.equal(attempt.questions.length, 1);
    await assert.rejects(new MockExamAttempt({
        ...attempt.toObject(),
        attemptLimit: 6,
    }).validate());
});

test("mock exam attempts have unique per-student request and attempt number indexes", () => {
    const indexes = MockExamAttempt.schema.indexes();
    assert.ok(indexes.some(([fields, options]) =>
        fields.student === 1 &&
        fields.exam === 1 &&
        fields.requestId === 1 &&
        options.unique === true
    ));
    assert.ok(indexes.some(([fields, options]) =>
        fields.student === 1 &&
        fields.exam === 1 &&
        fields.attemptNumber === 1 &&
        options.unique === true
    ));
});

test("mock exam scoring uses server snapshot and marks unanswered questions incorrect", () => {
    const attempt = createAttempt();
    const wrongOptionId = attempt.questions[0].options[1].id;
    attempt.answers = [{
        questionId: attempt.questions[0].questionId,
        selectedOptionId: wrongOptionId,
    }];

    const result = gradeMockExam(attempt);
    assert.equal(result.score, 0);
    assert.equal(result.percentage, 0);
    assert.equal(result.responses[0].isCorrect, false);
    assert.equal(result.responses[0].correctOptionId.toString(), attempt.questions[0].correctOptionId.toString());

    attempt.answers = [];
    const unansweredResult = gradeMockExam(attempt);
    assert.equal(unansweredResult.responses[0].selectedOptionId, null);
    assert.equal(unansweredResult.responses[0].isCorrect, false);
});

test("active mock exam serialization hides the answer key but completed reports include feedback", () => {
    const attempt = createAttempt();
    const active = serializeMockExamAttempt(
        attempt,
        new Date("2026-01-01T10:15:00.000Z").getTime()
    );
    assert.equal("correctOptionId" in active.questions[0], false);
    assert.equal("explanation" in active.questions[0], false);
    assert.equal(active.questions[0].options.length, 2);
    assert.ok(active.timeRemainingMs > 0);

    const result = gradeMockExam(attempt);
    attempt.status = "submitted";
    attempt.score = result.score;
    attempt.totalQuestions = result.totalQuestions;
    attempt.percentage = result.percentage;
    attempt.responses = result.responses;
    const report = serializeMockExamAttempt(attempt);
    assert.equal(report.responses[0].explanation, "A pipette delivers a fixed volume accurately.");
    assert.equal("questions" in report, false);
});

test("quiz documents validate timed exam settings without requiring them for practice quizzes", async () => {
    const quiz = new Quiz({
        title: "Timed practical",
        subject: "Chemistry",
        topic: "Apparatus",
        difficulty: "Intermediate",
        durationMinutes: 30,
        description: "A timed exam.",
        isMockExam: true,
        attemptLimit: 2,
        createdBy: new mongoose.Types.ObjectId(),
        questions: [{
            prompt: "Select a pipette.",
            options: [{ text: "Pipette" }, { text: "Beaker" }],
            correctOptionIndex: 0,
        }],
    });
    await quiz.validate();
    assert.equal(quiz.isMockExam, true);
    assert.equal(quiz.attemptLimit, 2);

    quiz.attemptLimit = 6;
    await assert.rejects(quiz.validate());
});
