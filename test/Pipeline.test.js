import { describe, it, expect, vi } from "vitest";
import { createProblemSchema } from "../server/validators/problem.validator.js";
import { createSubmissionSchema } from "../server/validators/submission.validator.js";
import {
    checkApplicationWindow,
    checkApplicantType,
    checkDpiitRequirement,
    checkSectorAlignment,
} from "../server/services/eligibility/rule.js";
import { PROBLEM_STATUS } from "../server/models/problem.model.js";
import { SUBMISSION_STATUS } from "../server/models/submission.model.js";
import { canTransition, assertTransition } from "../server/services/submission/transitionGuard.js";
import { ROLES } from "../server/constants/role.constant.js";

describe("Phase 1: Problem Discovery, Rules Engine Eligibility & Application Pipeline", () => {
    describe("Stage 1: Problem Formulation & Publication", () => {
        it("should validate a well-formed government challenge statement", () => {
            const validProblemInput = {
                title: "Real-Time Non-Revenue Water Loss Detection in Pune",
                shortSummary: "Deploying acoustic IoT sensors to detect pipeline leakages under 15 minutes.",
                fullStatement: "The Pune Municipal Corporation requires an autonomous AIoT sensor network capable of monitoring distribution mains for acoustic frequency signatures of subterranean pipe bursts.",
                organizationId: "66f000000000000000000001",
                sectors: ["Water Governance", "Smart City"],
                geography: {
                    state: "Maharashtra",
                    districts: ["Pune"],
                },
                mandatoryRequirements: ["Working prototype demonstrative in field conditions", "DPIIT recognition mandatory"],
                preferredRequirements: ["TRL >= 4", "Pilot Duration: 12 weeks"],
                constraints: ["Must store citizen data within State Data Centre (SDC)"],
                eligibleApplicantTypes: ["STARTUP"],
                procurementPath: "DIRECT_PILOT",
            };

            const result = createProblemSchema.safeParse(validProblemInput);
            expect(result.success).toBe(true);
        });

        it("should reject challenge statements with missing required fields", () => {
            const invalidInput = {
                title: "Too short",
                shortSummary: "Too short",
            };

            const result = createProblemSchema.safeParse(invalidInput);
            expect(result.success).toBe(false);
            expect(result.error.issues.length).toBeGreaterThan(0);
        });
    });

    describe("Stage 2: Deterministic Statutory Eligibility Verification", () => {
        const testProblem = {
            status: PROBLEM_STATUS.PUBLISHED,
            applicationOpenAt: "2026-09-01T00:00:00Z",
            applicationCloseAt: "2026-10-30T23:59:59Z",
            eligibleApplicantTypes: ["STARTUP"],
            mandatoryRequirements: ["DPIIT recognition mandatory for GFR 173(i) exemption"],
            sectors: ["Water Governance", "Clean Tech"],
        };

        const now = new Date("2026-09-20T12:00:00Z");

        it("should confirm eligibility for a recognized DPIIT startup with sector alignment", () => {
            const org = { type: "STARTUP" };
            const profile = {
                dpiitRecognitionNumber: "DIPP99401",
                stage: "EARLY_TRACTION",
                sectors: ["Water Governance"],
            };

            const windowResult = checkApplicationWindow(testProblem, now);
            const typeResult = checkApplicantType(org, testProblem);
            const dpiitResult = checkDpiitRequirement(profile, testProblem);
            const sectorResult = checkSectorAlignment(profile, testProblem);

            expect(windowResult.passed).toBe(true);
            expect(typeResult.passed).toBe(true);
            expect(dpiitResult.passed).toBe(true);
            expect(sectorResult.matched).toBe(true);
            expect(sectorResult.matchedSectors).toContain("Water Governance");
        });

        it("should block an entity without DPIIT recognition when challenge mandates it", () => {
            const org = { type: "STARTUP" };
            const profile = { dpiitRecognitionNumber: null };

            const dpiitResult = checkDpiitRequirement(profile, testProblem);
            expect(dpiitResult.passed).toBe(false);
            expect(dpiitResult.blocker).toContain("DPIIT recognition");
            expect(dpiitResult.missingEvidence).toContain("DPIIT Recognition Certificate");
        });

        it("should block ineligible applicant entity types (e.g. ACADEMIA or LARGE_ENTERPRISE)", () => {
            const org = { type: "ACADEMIA" };
            const typeResult = checkApplicantType(org, testProblem);
            expect(typeResult.passed).toBe(false);
            expect(typeResult.blocker).toContain("is not eligible");
        });
    });

    describe("Stage 3: Startup Proposal Application & FSM State Ingestion", () => {
        it("should validate and accept a proposal payload with SUBMITTED status", () => {
            const validSubmission = {
                problemId: "66f000000000000000000001",
                organizationId: "66f000000000000000000002",
                solutionTitle: "AquaSense AI Subterranean Leak Detector",
                executiveSummary: "Autonomous edge-AI acoustic node array for 15-minute municipal pipe leak localization.",
                proposalDetails: "Our architecture deploys piezoelectric transducers at 500m intervals across the PMC pilot zone, communicating via sovereign LoRaWAN gateways directly to the Maharashtra SDC.",
                evidenceFileIds: ["ev_doc_01", "ev_doc_02"],
                status: SUBMISSION_STATUS.SUBMITTED,
            };

            const result = createSubmissionSchema.safeParse(validSubmission);
            expect(result.success).toBe(true);
            expect(result.data.status).toBe(SUBMISSION_STATUS.SUBMITTED);
        });

        it("should default status to SUBMITTED if omitted during wizard submission", () => {
            const submissionPayload = {
                problemId: "66f000000000000000000001",
                organizationId: "66f000000000000000000002",
                solutionTitle: "AquaSense AI Subterranean Leak Detector",
                executiveSummary: "Autonomous edge-AI acoustic node array for 15-minute municipal pipe leak localization.",
                proposalDetails: "Our architecture deploys piezoelectric transducers at 500m intervals across the PMC pilot zone, communicating via sovereign LoRaWAN gateways directly to the Maharashtra SDC.",
            };

            const result = createSubmissionSchema.safeParse(submissionPayload);
            expect(result.success).toBe(true);
            expect(result.data.status).toBe(SUBMISSION_STATUS.SUBMITTED);
        });

        it("should verify legal FSM lifecycle transitions from SUBMITTED", () => {
            // Legal next steps from SUBMITTED
            expect(canTransition(SUBMISSION_STATUS.SUBMITTED, SUBMISSION_STATUS.UNDER_REVIEW)).toBe(true);
            expect(canTransition(SUBMISSION_STATUS.SUBMITTED, SUBMISSION_STATUS.WITHDRAWN)).toBe(true);

            // Illegal forward jumps
            expect(canTransition(SUBMISSION_STATUS.SUBMITTED, SUBMISSION_STATUS.ACCEPTED)).toBe(false);
            expect(canTransition(SUBMISSION_STATUS.SUBMITTED, SUBMISSION_STATUS.PILOT_ACTIVE)).toBe(false);
            expect(canTransition(SUBMISSION_STATUS.SUBMITTED, SUBMISSION_STATUS.SCALED)).toBe(false);
        });

        it("should verify role permissions: Only Government/Evaluator/Admin can move SUBMITTED to UNDER_REVIEW", () => {
            expect(() => {
                assertTransition({
                    fromStatus: SUBMISSION_STATUS.SUBMITTED,
                    toStatus: SUBMISSION_STATUS.UNDER_REVIEW,
                    actorRole: ROLES.GOVERNMENT_USER,
                });
            }).not.toThrow();

            expect(() => {
                assertTransition({
                    fromStatus: SUBMISSION_STATUS.SUBMITTED,
                    toStatus: SUBMISSION_STATUS.UNDER_REVIEW,
                    actorRole: ROLES.STARTUP_USER,
                });
            }).toThrowError(/not permitted to transition/);
        });
    });
});
