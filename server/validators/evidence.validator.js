import { z } from "zod";
import { ENTITY_TYPES } from "../models/evidence.model.js";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

// Allowed MIME types for proposals, papers, certificates, and pitch decks
export const ALLOWED_MIME_TYPES = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/webp",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/zip",
];

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

export const createUploadIntentSchema = z.object({
    fileName: z
        .string({ required_error: "File name is required" })
        .trim()
        .min(1, "File name cannot be empty")
        .max(255, "File name cannot exceed 255 characters"),

    mimeType: z
        .string({ required_error: "MIME type is required" })
        .trim()
        .refine(
            (mime) => ALLOWED_MIME_TYPES.includes(mime.toLowerCase()),
            `Unsupported file type. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`
        ),

    sizeBytes: z
        .number({ required_error: "File size is required" })
        .int("File size must be an integer")
        .min(1, "File cannot be empty")
        .max(MAX_FILE_SIZE, `File size exceeds max limit of 25MB`),

    entityType: z.enum(Object.values(ENTITY_TYPES), {
        required_error: "Entity type is required",
    }),

    entityId: z
        .string({ required_error: "Entity ID is required" })
        .regex(objectIdRegex, "Invalid entity ID format"),
});

export const finalizeUploadSchema = z.object({
    checksumSHA256: z.string().trim().optional(),
    actualSizeBytes: z.number().int().min(1).optional(),
});
