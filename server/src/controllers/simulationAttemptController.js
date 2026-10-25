import SimulationAttempt from "../models/SimulationAttempt.js";

function scoreAttempt(payload) {
    const techniqueValues = [
        payload.technique?.connectedAmmeter,
        payload.technique?.connectedVoltmeter,
        payload.technique?.correctPolarity,
        payload.technique?.switchUsed,
    ];
    const technique = techniqueValues.filter(Boolean).length;
    const readings = Array.isArray(payload.readings) ? payload.readings : [];
    const recording = readings.length >= 6 ? 2 : readings.length > 0 ? 1 : 0;
    const gradient = Number(payload.labSheet?.gradient);
    const calculation = Number.isFinite(gradient) && gradient > 0 ? 2 : 0;
    const conclusion = typeof payload.labSheet?.conclusion === "string"
        ? payload.labSheet.conclusion.trim()
        : "";
    const reasoning = conclusion.length >= 20 ? 2 : 0;

    return {
        technique,
        recording,
        calculation,
        reasoning,
        total: technique + recording + calculation + reasoning,
        maximum: 10,
    };
}

function serializeAttempt(attempt) {
    return {
        id: attempt._id.toString(),
        clientAttemptId: attempt.clientAttemptId,
        simulation: attempt.simulation,
        mode: attempt.mode,
        score: attempt.score,
        submittedAt: attempt.submittedAt,
    };
}

export async function syncSimulationAttempt(req, res, next) {
    try {
        const body = req.body || {};
        if (
            typeof body.clientAttemptId !== "string" ||
            !/^[a-zA-Z0-9_-]{8,100}$/.test(body.clientAttemptId) ||
            body.simulation !== "ohms-law" ||
            !["guided", "practice", "exam"].includes(body.mode) ||
            typeof body.seed !== "string" ||
            !body.seed.trim()
        ) {
            return res.status(400).json({
                message: "A valid simulation attempt is required.",
            });
        }

        const readings = Array.isArray(body.readings) ? body.readings : [];
        if (
            readings.length > 20 ||
            readings.some((reading) =>
                !Number.isFinite(reading?.current) ||
                !Number.isFinite(reading?.voltage) ||
                reading.current < 0 ||
                reading.voltage < 0
            )
        ) {
            return res.status(400).json({
                message: "The simulation readings are invalid.",
            });
        }

        const score = scoreAttempt(body);
        const data = {
            clientAttemptId: body.clientAttemptId,
            student: req.user._id,
            simulation: body.simulation,
            mode: body.mode,
            seed: body.seed.trim(),
            readings,
            technique: body.technique || {},
            labSheet: {
                scale: typeof body.labSheet?.scale === "string"
                    ? body.labSheet.scale
                    : "",
                gradient: Number.isFinite(Number(body.labSheet?.gradient))
                    ? Number(body.labSheet.gradient)
                    : null,
                conclusion: typeof body.labSheet?.conclusion === "string"
                    ? body.labSheet.conclusion
                    : "",
            },
            score,
            submittedAt: body.submittedAt ? new Date(body.submittedAt) : new Date(),
        };

        const attempt = await SimulationAttempt.findOneAndUpdate(
            { student: req.user._id, clientAttemptId: body.clientAttemptId },
            { $setOnInsert: data },
            { new: true, upsert: true, runValidators: true }
        );

        return res.status(200).json({
            message: "Simulation attempt synced.",
            attempt: serializeAttempt(attempt),
        });
    } catch (error) {
        return next(error);
    }
}

export async function listSimulationAttempts(req, res, next) {
    try {
        const attempts = await SimulationAttempt.find({
            student: req.user._id,
        })
            .sort({ submittedAt: -1 })
            .limit(50)
            .lean();

        return res.json({
            attempts: attempts.map(serializeAttempt),
        });
    } catch (error) {
        return next(error);
    }
}
