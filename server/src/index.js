
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/database.js";

import experimentRoutes from "./routes/experiments.js";
import authRoutes from "./routes/auth.js";
import savedExperimentRoutes from "./routes/savedExperiments.js";
import feedbackRoutes from "./routes/feedback.js";
import experimentCompletionRoutes from "./routes/experimentCompletions.js";
import adminQuizRoutes from "./routes/adminQuizzes.js";
import quizRoutes from "./routes/quizzes.js";
import studentProgressRoutes from "./routes/studentProgress.js";
import mockExamRoutes from "./routes/mockExams.js";
import adminUserRoutes from "./routes/adminUsers.js";
import adminFeedbackRoutes from "./routes/adminFeedback.js";
import simulationAttemptRoutes from "./routes/simulationAttempts.js";
import simulationChallengeRoutes from "./routes/simulationChallenges.js";
import adminSimulationRoutes from "./routes/adminSimulations.js";
import simulationPackRoutes from "./routes/simulationPacks.js";

const app = express();
app.use(
    cors({
        origin: env.clientUrl,
    })
);

app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
    res.json({
        status: "ok",
        message: "PrepSure API is running.",
        endpoints: {
            health: "/api/health",
            experiments: "/api/experiments",
        },
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        message: "PrepSure API is running.",
        database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    });
});

app.use("/api/experiments", experimentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/saved-experiments", savedExperimentRoutes);
app.use("/api/experiment-completions", experimentCompletionRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/admin/quizzes", adminQuizRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/student-progress", studentProgressRoutes);
app.use("/api/mock-exams", mockExamRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/feedback", adminFeedbackRoutes);
app.use("/api/simulation-attempts", simulationAttemptRoutes);
app.use("/api/simulation-challenges", simulationChallengeRoutes);
app.use("/api/admin/simulations", adminSimulationRoutes);
app.use("/api/simulation-packs", simulationPackRoutes);

// Centralized error handler
app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    if (error.code === 11000) {
        return res.status(409).json({
            message: "An experiment with that slug already exists.",
        });
    }

    if (error.name === "ValidationError" || error.name === "CastError") {
        return res.status(400).json({
            message: error.message,
        });
    }

    console.error(error);

    res.status(500).json({
        message: "An unexpected server error occurred.",
    });
});

async function startServer() {
    try {
        await connectDatabase();

        app.listen(env.port, () => {
            console.log(`PrepSure API running at http://localhost:${env.port}`);
        });
    } catch (error) {
        console.error("Failed to start PrepSure API:", error.message);
        process.exit(1);
    }
}

startServer();
