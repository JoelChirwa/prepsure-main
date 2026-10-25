import SimulationAttempt from "../models/SimulationAttempt.js";
import SimulationDefinition from "../models/SimulationDefinition.js";

const defaultDefinition = {
    slug: "ohms-law",
    title: "Verify Ohm's law",
    subject: "Physics",
    skills: ["Connecting meters", "Recording readings", "Plotting a graph", "Finding a gradient"],
};

function serialize(definition, usage) {
    return {
        id: definition._id,
        slug: definition.slug,
        title: definition.title,
        subject: definition.subject,
        status: definition.status,
        skills: definition.skills,
        reviewNotes: definition.reviewNotes,
        signedOffAt: definition.signedOffAt,
        usage,
    };
}

export function summarizeSimulationMistakes(attempts) {
    const mistakes = {
        technique: 0,
        recording: 0,
        calculation: 0,
        reasoning: 0,
    };

    for (const attempt of attempts) {
        if (attempt.score.technique < 4) mistakes.technique += 1;
        if (attempt.score.recording < 2) mistakes.recording += 1;
        if (attempt.score.calculation < 2) mistakes.calculation += 1;
        if (attempt.score.reasoning < 2) mistakes.reasoning += 1;
    }

    return Object.entries(mistakes)
        .map(([area, attemptsWithLostMarks]) => ({ area, attemptsWithLostMarks }))
        .sort((left, right) => right.attemptsWithLostMarks - left.attemptsWithLostMarks);
}

async function getUsage(slug) {
    const attempts = await SimulationAttempt.find({ simulation: slug })
        .select("score")
        .lean();
    return {
        attempts: attempts.length,
        mistakes: summarizeSimulationMistakes(attempts),
    };
}

export async function listSimulationDefinitions(req, res, next) {
    try {
        let definition = await SimulationDefinition.findOne({ slug: "ohms-law" }).lean();
        if (!definition) {
            definition = await SimulationDefinition.create(defaultDefinition);
        }
        const usage = await getUsage(definition.slug);
        return res.json({ simulations: [serialize(definition, usage)] });
    } catch (error) {
        return next(error);
    }
}

export async function updateSimulationDefinition(req, res, next) {
    try {
        const { status, reviewNotes } = req.body || {};
        if (!["draft", "review", "published"].includes(status)) {
            return res.status(400).json({ message: "A valid simulation status is required." });
        }
        const update = {
            status,
            reviewNotes: typeof reviewNotes === "string" ? reviewNotes : "",
        };
        if (status === "published") {
            update.signedOffBy = req.user._id;
            update.signedOffAt = new Date();
        } else {
            update.signedOffBy = null;
            update.signedOffAt = null;
        }
        const definition = await SimulationDefinition.findOneAndUpdate(
            { slug: req.params.slug },
            { $set: update },
            { new: true, runValidators: true }
        ).lean();
        if (!definition) return res.status(404).json({ message: "Simulation definition not found." });
        const usage = await getUsage(definition.slug);
        return res.json({ simulation: serialize(definition, usage) });
    } catch (error) {
        return next(error);
    }
}
