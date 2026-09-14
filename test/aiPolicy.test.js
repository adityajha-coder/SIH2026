import { describe, it, expect } from "vitest";
import { aiPolicy, APPROVED_PROVIDERS, APPROVED_MODELS } from "../server/services/ai/ai.policy.js";

describe("AI Policy & Model Governance", () => {
    describe("validateCall (Zero-Price Allowlist)", () => {
        it("should approve registered zero-cost models", () => {
            expect(() => {
                aiPolicy.validateCall({ provider: "google", model: "gemini-3.6-flash" });
            }).not.toThrow();

            expect(() => {
                aiPolicy.validateCall({ provider: "google", model: "gemini-3.5-flash-lite" });
            }).not.toThrow();

            expect(() => {
                aiPolicy.validateCall({ provider: "groq", model: "openai/gpt-oss-20b" });
            }).not.toThrow();
        });

        it("should reject unauthorized paid models with 403 AI_MODEL_DISALLOWED", () => {
            try {
                aiPolicy.validateCall({ provider: "google", model: "gpt-4o" });
                expect.unreachable("Should have thrown error");
            } catch (err) {
                expect(err.statusCode).toBe(403);
                expect(err.code).toBe("AI_MODEL_DISALLOWED");
            }
        });

        it("should reject unapproved providers with 403 AI_PROVIDER_DISALLOWED", () => {
            try {
                aiPolicy.validateCall({ provider: "anthropic", model: "claude-3-5-sonnet" });
                expect.unreachable("Should have thrown error");
            } catch (err) {
                expect(err.statusCode).toBe(403);
                expect(err.code).toBe("AI_PROVIDER_DISALLOWED");
            }
        });
    });

    describe("sanitizeInput (Data Privacy & Prompt Sanitization)", () => {
        it("should redact Bearer authorization tokens", () => {
            const input = "User submitted request with bearer eyJhbGciOiJIUzI1NiJ9.token123 and header";
            const sanitized = aiPolicy.sanitizeInput(input);
            expect(sanitized).not.toContain("bearer eyJhbGciOiJIUzI1NiJ9");
            expect(sanitized).toContain("bearer [REDACTED]");
        });

        it("should truncate oversized prompts exceeding 30,000 characters", () => {
            const longInput = "A".repeat(35000);
            const sanitized = aiPolicy.sanitizeInput(longInput);
            expect(sanitized.length).toBeLessThan(35000);
            expect(sanitized).toContain("...[truncated for length]");
        });

        it("should return empty string for non-string inputs", () => {
            expect(aiPolicy.sanitizeInput(null)).toBe("");
            expect(aiPolicy.sanitizeInput(undefined)).toBe("");
            expect(aiPolicy.sanitizeInput(12345)).toBe("");
        });
    });
});
