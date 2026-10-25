import nodemailer from "nodemailer";
import { env } from "../config/env.js";

export function isEmailDeliveryConfigured() {
    const { host, isPortConfigured, user, password } = env.smtp;
    return Boolean(host && isPortConfigured && user && password);
}

function getTransporter() {
    const { host, port, isPortConfigured, secure, user, password } = env.smtp;

    if (!host || !isPortConfigured || !user || !password) {
        throw new Error("Email delivery is not configured.");
    }

    return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
            user,
            pass: password,
        },
    });
}

export async function sendPasswordResetEmail({ email, name, resetUrl }) {
    const transporter = getTransporter();
    const fromAddress = env.smtp.from || env.smtp.user;
    const from = env.smtp.fromName
        ? { name: env.smtp.fromName, address: fromAddress }
        : fromAddress;

    await transporter.sendMail({
        from,
        to: email,
        subject: "Reset your PrepSure password",
        text: `Hello ${name},\n\nUse this link to reset your PrepSure password. It expires in 30 minutes and can only be used once:\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
        html: `<p>Hello ${escapeHtml(name)},</p><p>Use the link below to reset your PrepSure password. It expires in 30 minutes and can only be used once.</p><p><a href="${escapeHtml(resetUrl)}">Reset your password</a></p><p>If you did not request this, you can ignore this email.</p>`,
    });
}

function escapeHtml(value) {
    return value.replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    })[character]);
}
