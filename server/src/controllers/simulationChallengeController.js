import crypto from "node:crypto";
import SimulationChallenge from "../models/SimulationChallenge.js";

function serializeScore(score) {
    if (!score) return null;
    return {
        technique: score.technique,
        recording: score.recording,
        calculation: score.calculation,
        reasoning: score.reasoning,
        total: score.total,
        maximum: score.maximum,
    };
}

function serializeChallenge(challenge) {
    return {
        code: challenge.code,
        simulation: challenge.simulation,
        seed: challenge.seed,
        creatorScore: serializeScore(challenge.creatorScore),
        opponentScore: serializeScore(challenge.opponentScore),
        expiresAt: challenge.expiresAt,
    };
}

export function validScore(score) {
    return score &&
        Number.isInteger(score.technique) &&
        Number.isInteger(score.recording) &&
        Number.isInteger(score.calculation) &&
        Number.isInteger(score.reasoning) &&
        Number.isInteger(score.total) &&
        score.technique >= 0 && score.technique <= 4 &&
        score.recording >= 0 && score.recording <= 2 &&
        score.calculation >= 0 && score.calculation <= 2 &&
        score.reasoning >= 0 && score.reasoning <= 2 &&
        score.total >= 0 && score.total <= 10 &&
        score.total === score.technique +
            score.recording +
            score.calculation +
            score.reasoning;
}

export async function createSimulationChallenge(req, res, next) {
    try {
        const { simulation, seed, score } = req.body || {};
        if (simulation !== "ohms-law" || typeof seed !== "string" || !seed.trim() || !validScore(score)) {
            return res.status(400).json({ message: "A valid completed simulation is required." });
        }

        const challenge = await SimulationChallenge.create({
            code: crypto.randomBytes(5).toString("hex").toUpperCase(),
            simulation,
            seed: seed.trim(),
            creatorScore: score,
            createdBy: req.user._id,
        });

        return res.status(201).json({ challenge: serializeChallenge(challenge) });
    } catch (error) {
        return next(error);
    }
}

export async function getSimulationChallenge(req, res, next) {
    try {
        const challenge = await SimulationChallenge.findOne({
            code: req.params.code.toUpperCase(),
            expiresAt: { $gt: new Date() },
        }).lean();

        if (!challenge) {
            return res.status(404).json({ message: "This challenge is no longer available." });
        }

        return res.json({ challenge: serializeChallenge(challenge) });
    } catch (error) {
        return next(error);
    }
}

export async function submitSimulationChallenge(req, res, next) {
    try {
        const { score } = req.body || {};
        if (!validScore(score)) {
            return res.status(400).json({ message: "A valid result is required." });
        }

        const challenge = await SimulationChallenge.findOneAndUpdate(
            {
                code: req.params.code.toUpperCase(),
                expiresAt: { $gt: new Date() },
                opponentScore: null,
            },
            { $set: { opponentScore: score } },
            { new: true, runValidators: true }
        );

        if (!challenge) {
            return res.status(409).json({ message: "This challenge is unavailable or already completed." });
        }

        return res.json({ challenge: serializeChallenge(challenge) });
    } catch (error) {
        return next(error);
    }
}
