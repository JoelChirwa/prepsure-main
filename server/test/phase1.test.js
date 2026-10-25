import assert from "node:assert/strict";
import test from "node:test";
import Experiment from "../src/models/Experiment.js";
import User from "../src/models/User.js";
import SimulationAttempt from "../src/models/SimulationAttempt.js";
import SimulationChallenge from "../src/models/SimulationChallenge.js";
import SimulationDefinition from "../src/models/SimulationDefinition.js";
import { summarizeSimulationMistakes } from "../src/controllers/adminSimulationController.js";
import { getSimulationPack } from "../src/controllers/simulationPackController.js";
import { validScore } from "../src/controllers/simulationChallengeController.js";
import { experiments } from "../../client/src/data/experiments.js";
import { summarizeSimulationSkills } from "../src/services/progressAnalytics.js";
import { createProgressRecommendations } from "../src/services/progressAnalytics.js";

test("student accounts accept configured class levels", async () => {
    const user = new User({
        name: "  Learner  ",
        email: "learner@example.com",
        passwordHash: "hashed-password",
        role: "student",
        classLevel: " Form 4 ",
    });

    test("simulation attempts validate the synced Ohm's law shape", async () => {
        const attempt = new SimulationAttempt({
            clientAttemptId: "attempt-1234",
            student: "507f1f77bcf86cd799439011",
            simulation: "ohms-law",
            mode: "practice",
            seed: "4.8-3.5-123",
            readings: [{ current: 0.2, voltage: 0.96 }],
            technique: {
                connectedAmmeter: true,
                connectedVoltmeter: true,
                correctPolarity: true,
                switchUsed: true,
            },
            labSheet: {
                scale: "1 cm = 0.1 A",
                gradient: 4.8,
                conclusion: "Voltage is directly proportional to current.",
            },
            score: {
                technique: 4,
                recording: 1,
                calculation: 2,
                reasoning: 2,
                total: 9,
                maximum: 10,
            },
        });

        test("simulation skills summarize marked attempt components", () => {
            const skills = summarizeSimulationSkills([
                {
                    score: {
                        technique: 4,
                        recording: 1,
                        calculation: 2,
                        reasoning: 0,
                    },
                },
                {
                    score: {
                        technique: 2,
                        recording: 2,
                        calculation: 1,
                        reasoning: 2,
                    },
                },
            ]);

            assert.deepEqual(
                skills.map(({ skill, percentage }) => ({ skill, percentage })),
                [
                    { skill: "Technique", percentage: 75 },
                    { skill: "Recording readings", percentage: 75 },
                    { skill: "Calculation", percentage: 75 },
                    { skill: "Reasoning", percentage: 50 },
                ]
            );
        });

        await attempt.validate();
        assert.equal(attempt.simulation, "ohms-law");
        assert.equal(attempt.score.total, 9);
    });

    await user.validate();
    assert.equal(user.name, "Learner");
    assert.equal(user.classLevel, "Form 4");
});

test("class level remains optional for existing admin accounts", async () => {
    const user = new User({
        name: "Administrator",
        email: "admin@example.com",
        passwordHash: "hashed-password",
        role: "admin",
    });

    await user.validate();
});

test("student accounts reject unsupported class levels", async () => {
    const user = new User({
        name: "Learner",
        email: "learner@example.com",
        passwordHash: "hashed-password",
        classLevel: "Form 9",
    });

    await assert.rejects(user.validate());
});

test("experiment schema accepts theory and apparatus image URLs", async () => {
    const experiment = new Experiment({
        slug: "test-practical",
        title: "Test practical",
        category: "Chemistry",
        difficulty: "Beginner",
        duration: "15 minutes",
        summary: "A test practical.",
        theory: "A scientific explanation.",
        apparatusImages: ["https://assets.example.org/apparatus.jpg"],
    });

    await experiment.validate();
    assert.equal(experiment.theory, "A scientific explanation.");
    assert.deepEqual(experiment.apparatusImages, [
        "https://assets.example.org/apparatus.jpg",
    ]);
});

test("all initial Chemistry seed experiments include theory", () => {
    assert.ok(experiments.length > 0);
    for (const experiment of experiments) {
        assert.ok(experiment.theory?.trim(), `${experiment.id} needs theory content`);
        assert.ok(Array.isArray(experiment.apparatusImages));
    }
});

test("simulation challenges validate privacy-safe seeded score data", async () => {
    const challenge = new SimulationChallenge({
        code: "ABC12345",
        simulation: "ohms-law",
        seed: "4.8-3.5-123",
        createdBy: "507f1f77bcf86cd799439011",
        creatorScore: {
            technique: 4,
            recording: 2,
            calculation: 2,
            reasoning: 1,
            total: 9,
            maximum: 10,
        },
    });

    test("simulation definitions support review and sign-off states", async () => {
        const definition = new SimulationDefinition({
            slug: "ohms-law",
            title: "Verify Ohm's law",
            status: "review",
            skills: ["Connecting meters"],
        });

        test("aggregate simulation mistakes contain no student data", () => {
            const mistakes = summarizeSimulationMistakes([
                {
                    score: { technique: 2, recording: 2, calculation: 1, reasoning: 0 },
                    student: "hidden-student-id",
                },
                {
                    score: { technique: 4, recording: 1, calculation: 2, reasoning: 2 },
                    student: "another-hidden-student-id",
                },
            ]);

            assert.deepEqual(mistakes, [
                { area: "technique", attemptsWithLostMarks: 1 },
                { area: "recording", attemptsWithLostMarks: 1 },
                { area: "calculation", attemptsWithLostMarks: 1 },
                { area: "reasoning", attemptsWithLostMarks: 1 },
            ]);
            assert.equal(JSON.stringify(mistakes).includes("student"), false);
        });

        test("the Ohm's law pack exposes a versioned route manifest", async () => {
            const response = {
                statusCode: 200,
                body: null,
                status(code) {
                    this.statusCode = code;
                    return this;
                },
                json(value) {
                    this.body = value;
                    return this;
                },
            };

            getSimulationPack({ params: { slug: "ohms-law" } }, response);
            assert.equal(response.statusCode, 200);
            assert.equal(response.body.pack.version, 1);
            assert.deepEqual(response.body.pack.resources, ["/", "/simulate/ohms-law"]);
        });

        test("challenge scores must reconcile component marks", () => {
            assert.equal(validScore({
                technique: 4,
                recording: 2,
                calculation: 2,
                reasoning: 1,
                total: 9,
                maximum: 10,
            }), true);
            assert.equal(validScore({
                technique: 4,
                recording: 2,
                calculation: 2,
                reasoning: 1,
                total: 10,
                maximum: 10,
            }), false);
        });

        await definition.validate();
        assert.equal(definition.status, "review");
        assert.equal(definition.signedOffAt, null);
    });

    await challenge.validate();
    assert.equal(challenge.creatorScore.total, 9);
    assert.equal(challenge.opponentScore, null);
});

test("recommendations prioritize a weak practical skill", () => {
    const recommendations = createProgressRecommendations({
        weakTopics: [],
        publishedQuizzes: [],
        incompleteExperiments: [],
        simulationSkills: [
            { skill: "Technique", percentage: 50 },
            { skill: "Reasoning", percentage: 80 },
        ],
    });

    assert.deepEqual(recommendations[0], {
        title: "Practise Technique",
        description: "Repeat the Ohm's law practical and focus on technique.",
        href: "/simulate/ohms-law",
    });
});
