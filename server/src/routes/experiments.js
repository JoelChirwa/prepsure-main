import express from "express";
import multer from "multer";
import { protect, requireAdmin } from "../middleware/auth.js";
import {
    createExperiment,
    deleteExperiment,
    getExperiment,
    listAdminExperiments,
    listExperiments,
    updateExperiment,
    uploadApparatusImage,
} from "../controllers/experimentController.js";

const router = express.Router();
const imageUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    fileFilter: (req, file, callback) => {
        if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.mimetype)) {
            callback(new Error("Upload a JPEG, PNG, WebP, or AVIF image."));
            return;
        }

        callback(null, true);
    },
});

function parseImageUpload(req, res, next) {
    imageUpload.single("image")(req, res, (error) => {
        if (error) {
            if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
                return res.status(413).json({
                    message: "Image must be 5 MB or smaller.",
                });
            }

            return res.status(400).json({ message: error.message });
        }

        return next();
    });
}

router.get("/", listExperiments);
router.get("/admin", protect, requireAdmin, listAdminExperiments);
router.post(
    "/admin/images",
    protect,
    requireAdmin,
    parseImageUpload,
    uploadApparatusImage
);
router.get("/:id", getExperiment);
router.post("/", protect, requireAdmin, createExperiment);
router.put("/:id", protect, requireAdmin, updateExperiment);
router.delete("/:id", protect, requireAdmin, deleteExperiment);

export default router;
