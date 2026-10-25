import assert from "node:assert/strict";
import test from "node:test";
import mongoose from "mongoose";
import Feedback from "../src/models/Feedback.js";
import User from "../src/models/User.js";
import { requireAdmin } from "../src/middleware/auth.js";

function responseRecorder() {
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

test("student accounts default active and retain reasoned administrator status history", async () => {
    const adminId = new mongoose.Types.ObjectId();
    const user = new User({
        name: "Student",
        email: "student@example.com",
        passwordHash: "hashed-password",
        statusHistory: [{
            isActive: false,
            changedBy: adminId,
            reason: "Repeated abuse of the learning platform.",
            changedAt: new Date(),
        }],
    });

    await user.validate();
    assert.equal(user.isActive, true);
    assert.equal(user.statusHistory[0].isActive, false);
    assert.equal(user.statusHistory[0].changedBy.toString(), adminId.toString());

    user.statusHistory[0].reason = "";
    await assert.rejects(user.validate());
});

test("feedback defaults to new and validates triage status and internal notes", async () => {
    const feedback = new Feedback({
        category: "question",
        name: "Student",
        email: "student@example.com",
        subject: "Experiment question",
        message: "Could you explain this procedure?",
    });
    await feedback.validate();
    assert.equal(feedback.status, "new");
    assert.equal(feedback.resolutionNote, "");

    feedback.status = "unknown";
    await assert.rejects(feedback.validate());
    feedback.status = "resolved";
    feedback.resolutionNote = "x".repeat(2001);
    await assert.rejects(feedback.validate());
});

test("admin-only operations reject student callers and allow administrators", () => {
    const denied = responseRecorder();
    let studentNext = false;
    requireAdmin({ user: { role: "student" } }, denied, () => {
        studentNext = true;
    });
    assert.equal(denied.statusCode, 403);
    assert.equal(studentNext, false);

    const allowed = responseRecorder();
    let adminNext = false;
    requireAdmin({ user: { role: "admin" } }, allowed, () => {
        adminNext = true;
    });
    assert.equal(adminNext, true);
});
