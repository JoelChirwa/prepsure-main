import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/database.js";

async function createAdmin() {
    try {
        const { name, email, password } = env.admin;

        if (!name || !email || !password) {
            throw new Error("Missing required admin settings in server/.env");
        }

        if (password.length < 12) {
            throw new Error("ADMIN_PASSWORD must be at least 12 characters long");
        }

        await connectDatabase();

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            console.log(`A user with email ${normalizedEmail} already exists.`);
            console.log("No account was changed.");
            return;
        }

        const passwordHash = await bcrypt.hash(password, 12);

        await User.create({
            name: name.trim(),
            email: normalizedEmail,
            passwordHash,
            role: "admin",
        });

        console.log(`Admin account created for ${normalizedEmail}.`);
    } catch (error) {
        console.error("Could not create admin:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

createAdmin();