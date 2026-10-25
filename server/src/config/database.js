import mongoose from "mongoose";
import { requireMongoDbUri } from "./env.js";

export async function connectDatabase() {
    await mongoose.connect(requireMongoDbUri());
    console.log("MongoDB connected successfully.");
}
