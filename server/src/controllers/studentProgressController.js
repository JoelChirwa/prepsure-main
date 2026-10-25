import Experiment from "../models/Experiment.js";
import ExperimentCompletion from "../models/ExperimentCompletion.js";
import MockExamAttempt from "../models/MockExamAttempt.js";
import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";
import SimulationAttempt from "../models/SimulationAttempt.js";
import {
    calculateScoreTrend,
    calculateStudyStreak,
    combineAssessmentMetrics,
    createProgressRecommendations,
    summarizeSimulationSkills,
    summarizeTopics,
} from "../services/progressAnalytics.js";

export async function getStudentProgress(req, res, next) {
    try {
        const studentId = req.user._id;
        const [completions, experiments, overallResults, mockExamResults, topicResults, mockExamTopics, recentAttempts, recentMockExamAttempts, completionDays, attemptDays, mockExamDays, quizzes, simulationAttempts] =
            await Promise.all([
                ExperimentCompletion.find({ student: studentId })
                    .select("experiment createdAt")
                    .lean(),
                Experiment.find({ published: true })
                    .select("_id slug title category summary")
                    .sort({ title: 1 })
                    .lean(),
                QuizAttempt.aggregate([
                    { $match: { student: studentId } },
                    {
                        $group: {
                            _id: null,
                            attempts: { $sum: 1 },
                            averageScore: { $avg: "$percentage" },
                        },
                    },
                ]),
                MockExamAttempt.aggregate([
                    {
                        $match: {
                            student: studentId,
                            status: { $in: ["submitted", "expired"] },
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            attempts: { $sum: 1 },
                            averageScore: { $avg: "$percentage" },
                        },
                    },
                ]),
                QuizAttempt.aggregate([
                    { $match: { student: studentId } },
                    { $unwind: "$responses" },
                    { $match: { "responses.topic": { $type: "string", $ne: "" } } },
                    {
                        $group: {
                            _id: "$responses.topic",
                            answers: { $sum: 1 },
                            correct: {
                                $sum: {
                                    $cond: ["$responses.isCorrect", 1, 0],
                                },
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            topic: "$_id",
                            answers: 1,
                            correct: 1,
                        },
                    },
                ]),
                MockExamAttempt.aggregate([
                    {
                        $match: {
                            student: studentId,
                            status: { $in: ["submitted", "expired"] },
                        },
                    },
                    { $unwind: "$responses" },
                    { $match: { "responses.topic": { $type: "string", $ne: "" } } },
                    {
                        $group: {
                            _id: "$responses.topic",
                            answers: { $sum: 1 },
                            correct: {
                                $sum: {
                                    $cond: ["$responses.isCorrect", 1, 0],
                                },
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            topic: "$_id",
                            answers: 1,
                            correct: 1,
                        },
                    },
                ]),
                QuizAttempt.find({ student: studentId })
                    .select("percentage submittedAt")
                    .sort({ submittedAt: -1 })
                    .limit(10)
                    .lean(),
                MockExamAttempt.find({
                    student: studentId,
                    status: { $in: ["submitted", "expired"] },
                })
                    .select("percentage submittedAt")
                    .sort({ submittedAt: -1 })
                    .limit(10)
                    .lean(),
                ExperimentCompletion.aggregate([
                    { $match: { student: studentId } },
                    {
                        $project: {
                            day: {
                                $dateToString: {
                                    format: "%Y-%m-%d",
                                    date: "$createdAt",
                                    timezone: "UTC",
                                },
                            },
                        },
                    },
                    { $group: { _id: "$day" } },
                ]),
                QuizAttempt.aggregate([
                    { $match: { student: studentId } },
                    {
                        $project: {
                            day: {
                                $dateToString: {
                                    format: "%Y-%m-%d",
                                    date: "$submittedAt",
                                    timezone: "UTC",
                                },
                            },
                        },
                    },
                    { $group: { _id: "$day" } },
                ]),
                MockExamAttempt.aggregate([
                    {
                        $match: {
                            student: studentId,
                            status: { $in: ["submitted", "expired"] },
                        },
                    },
                    {
                        $project: {
                            day: {
                                $dateToString: {
                                    format: "%Y-%m-%d",
                                    date: "$submittedAt",
                                    timezone: "UTC",
                                },
                            },
                        },
                    },
                    { $group: { _id: "$day" } },
                ]),
                Quiz.find({
                    published: true,
                    retired: false,
                    isMockExam: false,
                })
                    .select("title topic questions.topic")
                    .lean(),
                SimulationAttempt.find({ student: studentId })
                    .sort({ submittedAt: -1 })
                    .limit(50)
                    .lean(),
            ]);

        const completedExperimentIds = new Set(
            completions.map(({ experiment }) => String(experiment))
        );
        const incompleteExperiments = experiments.filter(
            ({ _id }) => !completedExperimentIds.has(String(_id))
        );
        const completedPublishedCount = experiments.length - incompleteExperiments.length;
        const topicTotals = new Map();
        for (const result of [...topicResults, ...mockExamTopics]) {
            const current = topicTotals.get(result.topic) || {
                topic: result.topic,
                answers: 0,
                correct: 0,
            };
            current.answers += result.answers;
            current.correct += result.correct;
            topicTotals.set(result.topic, current);
        }
        const topics = summarizeTopics([...topicTotals.values()]);
        const weakTopics = topics.filter(({ strength }) => strength === "weak");
        const studyStreak = calculateStudyStreak([
            ...completionDays.map(({ _id }) => _id),
            ...attemptDays.map(({ _id }) => _id),
            ...mockExamDays.map(({ _id }) => _id),
            ...simulationAttempts.map((attempt) =>
                new Date(attempt.submittedAt).toISOString().slice(0, 10)
            ),
        ]);
        const simulationScores = simulationAttempts.map((attempt) => ({
            percentage: Math.round((attempt.score.total / attempt.score.maximum) * 100),
            submittedAt: attempt.submittedAt,
        }));
        const simulationSkills = summarizeSimulationSkills(simulationAttempts);
        const quizResults = overallResults[0];
        const mockResults = mockExamResults[0];
        const assessmentAttempts = [
            ...recentAttempts,
            ...recentMockExamAttempts,
        ]
            .sort((left, right) =>
                new Date(right.submittedAt) - new Date(left.submittedAt)
            )
            .slice(0, 10);
        const assessmentMetrics = combineAssessmentMetrics(
            quizResults,
            mockResults
        );

        return res.json({
            experiments: {
                completed: completedPublishedCount,
                available: experiments.length,
            },
            quizzes: {
                ...assessmentMetrics,
                scoreTrend: calculateScoreTrend(assessmentAttempts),
            },
            topics: {
                strong: topics
                    .filter(({ strength }) => strength === "strong")
                    .sort((left, right) => right.percentage - left.percentage)
                    .slice(0, 3),
                weak: weakTopics.slice(0, 3),
            },
            studyStreak,
            simulations: {
                attempts: simulationAttempts.length,
                skills: simulationSkills,
                scoreTrend: calculateScoreTrend(simulationScores),
                history: simulationAttempts.slice(0, 10).map((attempt) => ({
                    id: attempt._id,
                    simulation: attempt.simulation,
                    mode: attempt.mode,
                    score: attempt.score,
                    submittedAt: attempt.submittedAt,
                })),
            },
            recommendations: createProgressRecommendations({
                weakTopics,
                publishedQuizzes: quizzes,
                incompleteExperiments,
                simulationSkills,
            }),
        });
    } catch (error) {
        return next(error);
    }
}
