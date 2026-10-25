import assert from "node:assert/strict";
import test from "node:test";
import {
    calculateScoreTrend,
    calculateStudyStreak,
    combineAssessmentMetrics,
    createProgressRecommendations,
    summarizeTopics,
} from "../src/services/progressAnalytics.js";

test("score trend compares earlier and recent saved attempts and requires four results", () => {
    const attempts = [70, 60, 80, 90].map((percentage) => ({ percentage }));
    const trend = calculateScoreTrend(attempts);

    assert.equal(trend.status, "declining");
    assert.equal(trend.previousAverage, 85);
    assert.equal(trend.recentAverage, 65);
    assert.equal(trend.change, -20);
    assert.equal(
        calculateScoreTrend(attempts.slice(0, 3)).status,
        "insufficient-data"
    );
});

test("topic performance requires three answers to classify strength", () => {
    const topics = summarizeTopics([
        { topic: "Safety", answers: 2, correct: 0 },
        { topic: "Acids", answers: 4, correct: 1 },
        { topic: "Apparatus", answers: 5, correct: 5 },
    ]);

    assert.deepEqual(
        topics.map(({ topic, strength, percentage }) => ({
            topic,
            strength,
            percentage,
        })),
        [
            { topic: "Safety", strength: "developing", percentage: 0 },
            { topic: "Acids", strength: "weak", percentage: 25 },
            { topic: "Apparatus", strength: "strong", percentage: 100 },
        ]
    );
});

test("progress combines practice and mock-exam results once using attempt-weighted scores", () => {
    assert.deepEqual(
        combineAssessmentMetrics(
            { attempts: 2, averageScore: 90 },
            { attempts: 1, averageScore: 30 }
        ),
        {
            attempts: 3,
            practiceAttempts: 2,
            mockExamAttempts: 1,
            averageScore: 70,
        }
    );
    assert.deepEqual(
        combineAssessmentMetrics(null, null),
        {
            attempts: 0,
            practiceAttempts: 0,
            mockExamAttempts: 0,
            averageScore: null,
        }
    );
});

test("study streak combines unique UTC activity days and expires after a missed day", () => {
    assert.deepEqual(
        calculateStudyStreak(
            ["2026-05-01", "2026-05-02", "2026-05-02", "2026-05-03"],
            new Date("2026-05-03T12:00:00.000Z")
        ),
        { currentDays: 3, longestDays: 3 }
    );
    assert.deepEqual(
        calculateStudyStreak(
            ["2026-05-01", "2026-05-02"],
            new Date("2026-05-04T12:00:00.000Z")
        ),
        { currentDays: 0, longestDays: 2 }
    );
});

test("recommendations link weak topics to matching published quizzes and experiments", () => {
    const recommendations = createProgressRecommendations({
        weakTopics: [{ topic: "Acids" }],
        publishedQuizzes: [{
            _id: "quiz-id",
            topic: "General chemistry",
            questions: [{ topic: "Acids" }],
        }],
        incompleteExperiments: [{
            _id: "experiment-id",
            slug: "acid-titration",
            title: "Acid titration",
            category: "Chemistry",
        }],
    });

    assert.deepEqual(recommendations, [
        {
            title: "Practice Acids",
            description: "Review your Acids results with this published quiz.",
            href: "/quizzes/quiz-id",
        },
        {
            title: "Continue your practical learning",
            description: "Explore Acid titration, which you have not marked complete.",
            href: "/experiments/acid-titration",
        },
    ]);
});
