import { describe, it, expect } from "vitest";
import {
    createUploadIntentSchema,
    ALLOWED_MIME_TYPES,
} from "../server/validators/evidence.validator.js";

describe("Evidence Upload Validator", () => {
    const validEntityId = "66f000000000000000000001";

    it("should accept valid PDF and image uploads under 25MB", () => {
        const payload = {
            fileName: "Field_Trial_Telemetry.pdf",
            mimeType: "application/pdf",
            sizeBytes: 5 * 1024 * 1024, // 5MB
            entityType: "SUBMISSION",
            entityId: validEntityId,
        };

        const result = createUploadIntentSchema.safeParse(payload);
        expect(result.success).toBe(true);
    });

    it("should accept modern data formats (CSV and JSON)", () => {
        const csvPayload = {
            fileName: "sensor_stream_day1.csv",
            mimeType: "text/csv",
            sizeBytes: 1024 * 50,
            entityType: "SUBMISSION",
            entityId: validEntityId,
        };
        expect(createUploadIntentSchema.safeParse(csvPayload).success).toBe(true);

        const jsonPayload = {
            fileName: "benchmark_output.json",
            mimeType: "application/json",
            sizeBytes: 1024 * 200,
            entityType: "SUBMISSION",
            entityId: validEntityId,
        };
        expect(createUploadIntentSchema.safeParse(jsonPayload).success).toBe(true);
    });

    it("should reject disallowed executable file MIME types", () => {
        const payload = {
            fileName: "malicious_script.exe",
            mimeType: "application/x-msdownload",
            sizeBytes: 1024,
            entityType: "SUBMISSION",
            entityId: validEntityId,
        };

        const result = createUploadIntentSchema.safeParse(payload);
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toContain("Unsupported file type");
    });

    it("should reject files exceeding the 25MB limit", () => {
        const payload = {
            fileName: "giant_archive.zip",
            mimeType: "application/zip",
            sizeBytes: 25 * 1024 * 1024 + 1, // 25MB + 1 byte
            entityType: "SUBMISSION",
            entityId: validEntityId,
        };

        const result = createUploadIntentSchema.safeParse(payload);
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toContain("exceeds max limit of 25MB");
    });

    it("should reject invalid MongoDB ObjectId format for entityId", () => {
        const payload = {
            fileName: "charter.pdf",
            mimeType: "application/pdf",
            sizeBytes: 1024 * 100,
            entityType: "SUBMISSION",
            entityId: "invalid-not-24-hex-chars",
        };

        const result = createUploadIntentSchema.safeParse(payload);
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toContain("Invalid entity ID format");
    });
});
