
import mongoose from "mongoose";
import Experiment from "./models/Experiment.js";
import { experiments } from "../../client/src/data/experiments.js";
import { connectDatabase } from "./config/database.js";

async function seedExperiments() {
    try {
        await connectDatabase();

        for (const item of experiments) {
            const { id, ...fields } = item;

            await Experiment.findOneAndUpdate(
                { slug: id },
                { $set: { ...fields, slug: id } },
                { upsert: true, returnDocument: "after", runValidators: true }
            );
        }

        console.log(`Imported ${experiments.length} experiments.`);
    } catch (error) {
        console.error("Failed to seed experiments:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

seedExperiments();
