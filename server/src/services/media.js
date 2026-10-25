import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";

export function isMediaStorageConfigured() {
    return Boolean(
        env.cloudinary.cloudName &&
        env.cloudinary.apiKey &&
        env.cloudinary.apiSecret
    );
}

function getCloudinaryClient() {
    if (!isMediaStorageConfigured()) {
        throw new Error("Apparatus image storage is not configured.");
    }

    cloudinary.config({
        cloud_name: env.cloudinary.cloudName,
        api_key: env.cloudinary.apiKey,
        api_secret: env.cloudinary.apiSecret,
        secure: true,
    });

    return cloudinary;
}

export function uploadExperimentImage(buffer) {
    const client = getCloudinaryClient();

    return new Promise((resolve, reject) => {
        const upload = client.uploader.upload_stream(
            {
                folder: "prepsure/experiments",
                resource_type: "image",
                allowed_formats: ["jpg", "jpeg", "png", "webp", "avif"],
            },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }

                if (!result?.secure_url) {
                    reject(new Error("Image storage returned no secure URL."));
                    return;
                }

                resolve(result.secure_url);
            }
        );

        upload.end(buffer);
    });
}
