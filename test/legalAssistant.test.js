import { describe, it, expect } from "vitest";
import {
    legalAssistantService,
    sanitizePlainText,
    matchOfficialLinks,
    matchPlatformActions,
    OFFICIAL_GOVERNMENT_LINKS,
} from "../server/services/ai/legalAssistant.service.js";
import { legalQuerySchema } from "../server/validators/ai.validator.js";

describe("Startup Legal Assistant Service (OpenRouter)", () => {
    describe("sanitizePlainText (Zero # and * Typography Guarantee)", () => {
        it("should completely eliminate markdown hashes (#, ##, ###)", () => {
            const raw = "### What is DPIIT?\n## Key Benefits:\n# Conclusion";
            const cleaned = sanitizePlainText(raw);
            expect(cleaned).not.toContain("#");
            expect(cleaned).toContain("What is DPIIT?");
            expect(cleaned).toContain("Key Benefits:");
        });

        it("should completely eliminate markdown asterisks (*, **, ***)", () => {
            const raw = "DPIIT provides **100% EMD waiver** and *turnover exemption* for ***all startups***.";
            const cleaned = sanitizePlainText(raw);
            expect(cleaned).not.toContain("*");
            expect(cleaned).toContain("100% EMD waiver and turnover exemption for all startups.");
        });

        it("should handle mixed complex formatting without any # or *", () => {
            const raw = "## Section 1: Introduction\n* Point 1: **DPIIT**\n* Point 2: **GFR 173(i)**\n### Summary";
            const cleaned = sanitizePlainText(raw);
            expect(cleaned).not.toMatch(/[#*]/);
        });

        it("should return empty string for null or undefined input", () => {
            expect(sanitizePlainText(null)).toBe("");
            expect(sanitizePlainText(undefined)).toBe("");
            expect(sanitizePlainText("")).toBe("");
        });
    });

    describe("matchOfficialLinks (Official Government Citations)", () => {
        it("should match DPIIT queries to Startup India and DPIIT official portals", () => {
            const links = matchOfficialLinks("what is dpiit recognition", "DPIIT startup portal");
            expect(links.some((l) => l.url.includes("startupindia.gov.in"))).toBe(true);
        });

        it("should match GFR or procurement queries to Department of Expenditure", () => {
            const links = matchOfficialLinks("GFR 173(i) turnover waiver", "rules on tender procurement");
            expect(links.some((l) => l.url.includes("doe.gov.in"))).toBe(true);
        });

        it("should match GeM queries to Government e-Marketplace", () => {
            const links = matchOfficialLinks("how to get on GeM marketplace", "direct procurement on gem");
            expect(links.some((l) => l.url.includes("gem.gov.in"))).toBe(true);
        });

        it("should match payment delay queries to MSME Samadhaan", () => {
            const links = matchOfficialLinks("delayed payment section 15 msmed", "payment delay monitoring");
            expect(links.some((l) => l.url.includes("samadhaan.msme.gov.in"))).toBe(true);
        });
    });

    describe("matchPlatformActions (Pragati-GovX Navigation)", () => {
        it("should match DPIIT questions to Startup Passport route", () => {
            const actions = matchPlatformActions("how to add dpiit number", "update your passport");
            expect(actions.some((a) => a.route === "/startup/profile")).toBe(true);
        });

        it("should match challenge queries to Challenges explorer", () => {
            const actions = matchPlatformActions("where do I apply for tenders", "explore published problems");
            expect(actions.some((a) => a.route === "/challenges")).toBe(true);
        });
    });

    describe("queryAssistant (End-to-End Execution)", () => {
        it("should answer 'what is DPIIT' without any # or * and provide official links", async () => {
            const result = await legalAssistantService.queryAssistant({
                query: "what is DPIIT",
                startupUser: { name: "Ankit Sharma", organizationName: "AeroTech Labs" },
            });

            expect(result).toBeDefined();
            expect(result.answer).toBeDefined();
            expect(result.answer.length).toBeGreaterThan(50);

            // Strict typography test
            expect(result.answer.includes("#")).toBe(false);
            expect(result.answer.includes("*")).toBe(false);

            // Content test
            expect(result.answer.toLowerCase()).toContain("dpiit");

            // Official citations test
            expect(Array.isArray(result.officialLinks)).toBe(true);
            expect(result.officialLinks.length).toBeGreaterThan(0);
            expect(result.officialLinks[0].url).toMatch(/^https?:\/\//);

            // Pragati-GovX guidance test
            expect(Array.isArray(result.platformActions)).toBe(true);
            expect(result.platformActions.length).toBeGreaterThan(0);
        });
    });

    describe("legalQuerySchema (Zod Input Validation)", () => {
        it("should pass for valid query string", () => {
            const parsed = legalQuerySchema.safeParse({ query: "What is GFR Rule 173(i)?" });
            expect(parsed.success).toBe(true);
        });

        it("should reject empty or 1-character query", () => {
            const parsed = legalQuerySchema.safeParse({ query: "a" });
            expect(parsed.success).toBe(false);
        });

        it("should reject missing query", () => {
            const parsed = legalQuerySchema.safeParse({});
            expect(parsed.success).toBe(false);
        });
    });
});
