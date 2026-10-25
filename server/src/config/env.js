import "dotenv/config";

const smtpPort = process.env.SMTP_PORT
    ? Number(process.env.SMTP_PORT)
    : 587;
const smtpSecureValue = process.env.SMTP_SECURE?.toLowerCase();

if (!Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65535) {
    throw new Error("SMTP_PORT must be a valid port number.");
}

if (
    smtpSecureValue !== undefined &&
    !["true", "false"].includes(smtpSecureValue)
) {
    throw new Error("SMTP_SECURE must be either true or false.");
}

export const env = Object.freeze({
    port: Number(process.env.PORT) || 5001,
    clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
    isClientUrlConfigured: Boolean(process.env.CLIENT_URL),
    mongodbUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    smtp: Object.freeze({
        host: process.env.SMTP_HOST,
        port: smtpPort,
        isPortConfigured: Boolean(process.env.SMTP_PORT),
        secure: smtpSecureValue === undefined
            ? smtpPort === 465
            : smtpSecureValue === "true",
        user: process.env.SMTP_USER,
        password: process.env.SMTP_PASS || process.env.SMTP_PASSWORD,
        from: process.env.EMAIL_FROM || process.env.SMTP_FROM,
        fromName: process.env.EMAIL_FROM_NAME || process.env.SMTP_FROM_NAME,
    }),
    cloudinary: Object.freeze({
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
    }),
    admin: Object.freeze({
        name: process.env.ADMIN_NAME,
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
    }),
});

export function requireMongoDbUri() {
    if (!env.mongodbUri) {
        throw new Error("MONGODB_URI is missing from server/.env");
    }

    return env.mongodbUri;
}
