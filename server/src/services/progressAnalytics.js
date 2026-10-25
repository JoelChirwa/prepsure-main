const MIN_TOPIC_ANSWERS = 3;
const WEAK_TOPIC_THRESHOLD = 60;
const STRONG_TOPIC_THRESHOLD = 80;
const TREND_THRESHOLD = 5;

function round(value) {
    return Math.round(value * 10) / 10;
}

export function calculateScoreTrend(attempts) {
    const chronological = [...attempts].reverse();
    if (chronological.length < 4) {
        return {
            status: "insufficient-data",
            previousAverage: null,
            recentAverage: null,
            change: null,
            attemptsPerPeriod: 0,
        };
    }

    const splitIndex = Math.floor(chronological.length / 2);
    const previous = chronological.slice(0, splitIndex);
    const recent = chronological.slice(splitIndex);
    const average = (items) =>
        items.reduce((total, attempt) => total + attempt.percentage, 0) /
        items.length;
    const previousAverage = round(average(previous));
    const recentAverage = round(average(recent));
    const change = round(recentAverage - previousAverage);

    return {
        status: change >= TREND_THRESHOLD
            ? "improving"
            : change <= -TREND_THRESHOLD
                ? "declining"
                : "stable",
        previousAverage,
        recentAverage,
        change,
        attemptsPerPeriod: Math.min(previous.length, recent.length),
    };
}

export function combineAssessmentMetrics(quizResults, mockExamResults) {
    const practiceAttempts = quizResults?.attempts || 0;
    const mockExamAttempts = mockExamResults?.attempts || 0;
    const attempts = practiceAttempts + mockExamAttempts;

    return {
        attempts,
        practiceAttempts,
        mockExamAttempts,
        averageScore: attempts > 0
            ? Math.round(
                (
                    (quizResults?.averageScore || 0) * practiceAttempts +
                    (mockExamResults?.averageScore || 0) * mockExamAttempts
                ) / attempts
            )
            : null,
    };
}

export function calculateStudyStreak(activityDays, now = new Date()) {
    const days = [...new Set(activityDays)].sort();
    if (!days.length) {
        return { currentDays: 0, longestDays: 0 };
    }

    const dayMilliseconds = 24 * 60 * 60 * 1000;
    const latestDay = new Date(`${days[days.length - 1]}T00:00:00.000Z`);
    const today = new Date(`${now.toISOString().slice(0, 10)}T00:00:00.000Z`);
    const latestAge = Math.floor((today - latestDay) / dayMilliseconds);
    let longestDays = 1;
    let sequenceDays = 1;

    for (let index = 1; index < days.length; index += 1) {
        const previous = new Date(`${days[index - 1]}T00:00:00.000Z`);
        const current = new Date(`${days[index]}T00:00:00.000Z`);
        if ((current - previous) / dayMilliseconds === 1) {
            sequenceDays += 1;
            longestDays = Math.max(longestDays, sequenceDays);
        } else {
            sequenceDays = 1;
        }
    }

    let currentDays = 0;
    if (latestAge >= 0 && latestAge <= 1) {
        currentDays = 1;
        for (let index = days.length - 1; index > 0; index -= 1) {
            const previous = new Date(`${days[index - 1]}T00:00:00.000Z`);
            const current = new Date(`${days[index]}T00:00:00.000Z`);
            if ((current - previous) / dayMilliseconds !== 1) break;
            currentDays += 1;
        }
    }

    return { currentDays, longestDays };
}

export function summarizeTopics(topicAggregates) {
    return topicAggregates
        .filter(({ topic, answers }) => topic?.trim() && answers > 0)
        .map(({ topic, answers, correct }) => {
            const percentage = Math.round((correct / answers) * 100);
            const strength = answers < MIN_TOPIC_ANSWERS
                ? "developing"
                : percentage < WEAK_TOPIC_THRESHOLD
                    ? "weak"
                    : percentage >= STRONG_TOPIC_THRESHOLD
                        ? "strong"
                        : "developing";
            return { topic, answers, percentage, strength };
        })
        .sort((left, right) => left.percentage - right.percentage);
}

export function summarizeSimulationSkills(attempts) {
    const skills = [
        ["Technique", "technique", 4],
        ["Recording readings", "recording", 2],
        ["Calculation", "calculation", 2],
        ["Reasoning", "reasoning", 2],
    ];

    return skills.map(([skill, field, maximum]) => {
        const completed = attempts.filter((attempt) => attempt.score?.[field] !== undefined);
        const earned = completed.reduce(
            (total, attempt) => total + attempt.score[field],
            0
        );
        const possible = completed.length * maximum;
        const percentage = possible ? Math.round((earned / possible) * 100) : null;

        return {
            skill,
            attempts: completed.length,
            percentage,
            level: percentage === null
                ? "not-started"
                : percentage < 60
                    ? "needs-practice"
                    : percentage >= 80
                        ? "strong"
                        : "developing",
        };
    });
}

function normalize(value) {
    return value?.trim().toLocaleLowerCase() || "";
}

function matchesTopic(topic, values) {
    const normalizedTopic = normalize(topic);
    return values.some((value) => normalize(value) === normalizedTopic);
}

export function createProgressRecommendations({
    weakTopics,
    publishedQuizzes,
    incompleteExperiments,
    simulationSkills = [],
}) {
    const recommendations = [];
    const recommendedExperimentIds = new Set();
    const weakSkill = simulationSkills
        .filter(({ percentage }) => percentage !== null && percentage < 60)
        .sort((left, right) => left.percentage - right.percentage)[0];

    if (weakSkill) {
        recommendations.push({
            title: `Practise ${weakSkill.skill}`,
            description: `Repeat the Ohm's law practical and focus on ${weakSkill.skill.toLocaleLowerCase()}.`,
            href: "/simulate/ohms-law",
        });
    }

    for (const { topic } of weakTopics) {
        if (recommendations.length >= 3) break;
        const quiz = publishedQuizzes.find((candidate) =>
            matchesTopic(topic, [
                candidate.topic,
                ...candidate.questions.map((question) => question.topic),
            ])
        );
        if (quiz) {
            recommendations.push({
                title: `Practice ${topic}`,
                description: `Review your ${topic} results with this published quiz.`,
                href: `/quizzes/${quiz._id}`,
            });
            continue;
        }

        const experiment = incompleteExperiments.find((candidate) =>
            matchesTopic(topic, [
                candidate.category,
                candidate.title,
            ])
        );
        if (experiment && !recommendedExperimentIds.has(String(experiment._id))) {
            recommendedExperimentIds.add(String(experiment._id));
            recommendations.push({
                title: `Review ${topic}`,
                description: `Strengthen this topic with an unfinished practical experiment.`,
                href: `/experiments/${experiment.slug}`,
            });
        }
    }

    const nextExperiment = incompleteExperiments.find(
        (experiment) => !recommendedExperimentIds.has(String(experiment._id))
    );
    if (nextExperiment && recommendations.length < 3) {
        recommendations.push({
            title: "Continue your practical learning",
            description: `Explore ${nextExperiment.title}, which you have not marked complete.`,
            href: `/experiments/${nextExperiment.slug}`,
        });
    }

    if (recommendations.length === 0 && weakTopics.length === 0) {
        const nextQuiz = publishedQuizzes[0];
        if (nextQuiz) {
            recommendations.push({
                title: "Try a practice quiz",
                description: "Complete a quiz to build your revision history and topic feedback.",
                href: `/quizzes/${nextQuiz._id}`,
            });
        }
    }

    return recommendations;
}
