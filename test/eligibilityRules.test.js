import { describe, it, expect } from "vitest";
import {
    checkApplicationWindow,
    checkApplicantType,
    checkDpiitRequirement,
    checkSectorAlignment,
} from "../server/services/eligibility/rule.js";
import { PROBLEM_STATUS } from "../server/models/problem.model.js";

describe("Statutory Eligibility Rules Engine", () => {
    describe("checkApplicationWindow", () => {
        const now = new Date("2026-09-15T12:00:00Z");

        it("should approve when problem is PUBLISHED and dates are active", () => {
            const problem = {
                status: PROBLEM_STATUS.PUBLISHED,
                applicationOpenAt: "2026-09-01T00:00:00Z",
                applicationCloseAt: "2026-09-30T23:59:59Z",
            };
            const result = checkApplicationWindow(problem, now);
            expect(result.passed).toBe(true);
            expect(result.blocker).toBeNull();
        });

        it("should block when problem is in DRAFT status", () => {
            const problem = {
                status: PROBLEM_STATUS.DRAFT,
            };
            const result = checkApplicationWindow(problem, now);
            expect(result.passed).toBe(false);
            expect(result.blocker).toContain("not accepting submissions");
        });

        it("should block when application window has expired", () => {
            const problem = {
                status: PROBLEM_STATUS.PUBLISHED,
                applicationOpenAt: "2026-08-01T00:00:00Z",
                applicationCloseAt: "2026-09-01T00:00:00Z", // Past date
            };
            const result = checkApplicationWindow(problem, now);
            expect(result.passed).toBe(false);
            expect(result.blocker).toContain("closed");
        });

        it("should block when applications have not opened yet", () => {
            const problem = {
                status: PROBLEM_STATUS.PUBLISHED,
                applicationOpenAt: "2026-10-01T00:00:00Z", // Future date
                applicationCloseAt: "2026-11-01T00:00:00Z",
            };
            const result = checkApplicationWindow(problem, now);
            expect(result.passed).toBe(false);
            expect(result.blocker).toContain("open on");
        });
    });

    describe("checkApplicantType", () => {
        it("should pass when organization type is in eligibleApplicantTypes", () => {
            const problem = { eligibleApplicantTypes: ["STARTUP", "MSME"] };
            const organization = { type: "STARTUP" };
            expect(checkApplicantType(organization, problem).passed).toBe(true);
        });

        it("should block when organization type is not allowed", () => {
            const problem = { eligibleApplicantTypes: ["STARTUP"] };
            const organization = { type: "ACADEMIA" };
            const result = checkApplicantType(organization, problem);
            expect(result.passed).toBe(false);
            expect(result.blocker).toContain("is not eligible");
        });

        it("should pass when no specific applicant types are restricted", () => {
            const problem = { eligibleApplicantTypes: [] };
            const organization = { type: "INDIVIDUAL" };
            expect(checkApplicantType(organization, problem).passed).toBe(true);
        });
    });

    describe("checkDpiitRequirement (GFR Rule 173(i) Gate)", () => {
        it("should pass when challenge requires DPIIT and startup has valid number", () => {
            const problem = { mandatoryRequirements: ["DPIIT recognition mandatory for GFR 173(i) exemption"] };
            const startupProfile = { dpiitRecognitionNumber: "DIPP109482" };
            const result = checkDpiitRequirement(startupProfile, problem);
            expect(result.passed).toBe(true);
        });

        it("should block when challenge requires DPIIT but startup profile lacks number", () => {
            const problem = { mandatoryRequirements: ["Must be a registered startup india entity with DPIIT"] };
            const startupProfile = { dpiitRecognitionNumber: null };
            const result = checkDpiitRequirement(startupProfile, problem);
            expect(result.passed).toBe(false);
            expect(result.missingEvidence).toContain("DPIIT Recognition Certificate");
        });

        it("should pass when challenge does not mandate DPIIT recognition", () => {
            const problem = { mandatoryRequirements: ["Working Prototype Required"] };
            const startupProfile = { dpiitRecognitionNumber: null };
            expect(checkDpiitRequirement(startupProfile, problem).passed).toBe(true);
        });
    });

    describe("checkSectorAlignment", () => {
        it("should detect matching sectors case-insensitively", () => {
            const problem = { sectors: ["Water Management", "Smart City"] };
            const startupProfile = { sectors: ["water management", "agritech"] };
            const result = checkSectorAlignment(startupProfile, problem);
            expect(result.matched).toBe(true);
            expect(result.matchedSectors).toEqual(["Water Management"]);
        });

        it("should report no match when sectors are completely different", () => {
            const problem = { sectors: ["Healthcare"] };
            const startupProfile = { sectors: ["Fintech", "Cybersecurity"] };
            const result = checkSectorAlignment(startupProfile, problem);
            expect(result.matched).toBe(false);
            expect(result.matchedSectors).toHaveLength(0);
        });
    });
});
