import assert from "node:assert/strict";
import test from "node:test";
import mongoose from "mongoose";
import Quiz from "../src/models/Quiz.js";
import QuizAttempt from "../src/models/QuizAttempt.js";
import {
    gradeQuiz,
    serializeQuiz,
    validateQuizPayload,
} from "../src/controllers/quizController.js";
import { requireAdmin, requireStudent } from "../src/middleware/auth.js";

function createQuiz() {
    return new Quiz({
        title: "Lab safety",
        subject: "Chemistry",
        topic: "Safety",
        difficulty: "Beginner",
        durationMinutes: 5,
        description: "Practice laboratory safety.",
        published: true,
        createdBy: new mongoose.Types.ObjectId(),
        questions: [
            {
                prompt: "What should you wear when handling corrosive chemicals?",
                topic: "Protective equipment",
                options: [
                    { text: "Safety goggles" },
                    { text: "Sandals" },
                ],
                correctOptionIndex: 0,
                explanation: "Goggles protect eyes from splashes.",
            },
        ],
    });
}

function createResponseRecorder() {
    return {
        statusCode: 200,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        },
    };
}

test("quiz model validates and persists authored questions", async () => {
    const quiz = createQuiz();
    await quiz.validate();
    assert.equal(quiz.questions.length, 1);
    assert.equal(quiz.questions[0].options.length, 2);
});

test("quiz model rejects an answer index outside the options", async () => {
    const quiz = createQuiz();
    quiz.questions[0].correctOptionIndex = 2;
    await assert.rejects(quiz.validate());
});

test("quiz model rejects an empty question list", async () => {
    const quiz = createQuiz();
    quiz.questions = [];
    await assert.rejects(quiz.validate());
});

test("quiz payload requires a valid answer key and options", () => {
    const payload = {
        title: "Safety",
        subject: "Chemistry",
        topic: "Safety",
        difficulty: "Beginner",
        durationMinutes: 5,
        description: "A safety quiz.",
        questions: [
            {
                prompt: "Choose one.",
                options: [{ text: "A" }, { text: "B" }],
                correctOptionIndex: 0,
            },
        ],
    };
    assert.equal(validateQuizPayload(payload), null);
    assert.match(
        validateQuizPayload({
            ...payload,
            questions: [{
                ...payload.questions[0],
                correctOptionIndex: 3,
            }],
        }),
        /correct answer/
    );
});

test("student quiz serialization never returns correct answers or explanations", async () => {
    const quiz = createQuiz();
    await quiz.validate();

    const publicQuiz = serializeQuiz(quiz);
    assert.equal("correctOptionIndex" in publicQuiz.questions[0], false);
    assert.equal("explanation" in publicQuiz.questions[0], false);
    assert.equal(publicQuiz.questions[0].options.length, 2);

    const adminQuiz = serializeQuiz(quiz, { includeAnswers: true });
    assert.equal(adminQuiz.questions[0].correctOptionIndex, 0);
    assert.equal(
        adminQuiz.questions[0].explanation,
        "Goggles protect eyes from splashes."
    );
});

test("quiz scoring is server-derived and rejects omitted or foreign answers", async () => {
    const quiz = createQuiz();
    await quiz.validate();
    const question = quiz.questions[0];

    const correct = gradeQuiz(quiz, [{
        questionId: question._id,
        selectedOptionId: question.options[0]._id,
    }]);
    assert.equal(correct.score, 1);
    assert.equal(correct.percentage, 100);
    assert.equal(correct.responses[0].isCorrect, true);

    const incorrect = gradeQuiz(quiz, [{
        questionId: question._id,
        selectedOptionId: question.options[1]._id,
    }]);
    assert.equal(incorrect.score, 0);
    assert.equal(incorrect.responses[0].isCorrect, false);

    assert.match(gradeQuiz(quiz, []).error, /every question/);
    assert.match(gradeQuiz(quiz, [{
        questionId: new mongoose.Types.ObjectId(),
        selectedOptionId: question.options[0]._id,
    }]).error, /belong to this quiz/);
});

test("quiz attempts require a student, server score, and stable request id", async () => {
    const quiz = createQuiz();
    await quiz.validate();
    const question = quiz.questions[0];
    const attempt = new QuizAttempt({
        student: new mongoose.Types.ObjectId(),
        quiz: quiz._id,
        quizTitle: quiz.title,
        requestId: "b83f6aa6-42c3-4ecb-a786-6ce11b467c2a",
        ...gradeQuiz(quiz, [{
            questionId: question._id,
            selectedOptionId: question.options[0]._id,
        }]),
    });
    await attempt.validate();
    assert.equal(attempt.score, 1);
    assert.equal(attempt.totalQuestions, 1);
    assert.equal(attempt.responses[0].correctOptionId.toString(), question.options[0]._id.toString());
});

test("quiz attempts have a unique per-student request key for idempotent submission", () => {
    const indexes = QuizAttempt.schema.indexes();
    assert.ok(indexes.some(([fields, options]) =>
        fields.student === 1 &&
        fields.quiz === 1 &&
        fields.requestId === 1 &&
        options.unique === true
    ));
});

test("admin and student role guards enforce their role boundary", () => {
    let nextCalled = false;
    const adminResponse = createResponseRecorder();
    requireAdmin(
        { user: { role: "student" } },
        adminResponse,
        () => { nextCalled = true; }
    );
    assert.equal(adminResponse.statusCode, 403);
    assert.equal(nextCalled, false);

    const studentResponse = createResponseRecorder();
    requireStudent(
        { user: { role: "admin" } },
        studentResponse,
        () => { nextCalled = true; }
    );
    assert.equal(studentResponse.statusCode, 403);

    const allowedResponse = createResponseRecorder();
    requireAdmin(
        { user: { role: "admin" } },
        allowedResponse,
        () => { nextCalled = true; }
    );
    assert.equal(nextCalled, true);
});
