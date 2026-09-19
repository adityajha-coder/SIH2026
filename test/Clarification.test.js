import { describe, it, expect } from "vitest";
import { canTransition, assertTransition } from "../server/services/submission/transitionGuard.js";
import { SUBMISSION_STATUS } from "../server/models/submission.model.js";
import { ROLES } from "../server/constants/role.constant.js";
import { createAssignmentSchema } from "../server/validators/evaluation.validator.js";

describe("Phase 2: Proposal Screening, Clarification Loop & Evaluator Assignment", () => {
    describe("Stage 4: Proposal Screening & Clarification FSM Transitions", () => {
        it("should permit Government Officer to request clarification from SUBMITTED", () => {
            expect(canTransition(SUBMISSION_STATUS.SUBMITTED, SUBMISSION_STATUS.CLARIFICATION)).toBe(true);
            expect(() => {
                assertTransition({
                    fromStatus: SUBMISSION_STATUS.SUBMITTED,
                    toStatus: SUBMISSION_STATUS.CLARIFICATION,
                    actorRole: ROLES.GOVERNMENT_USER,
                });
            }).not.toThrow();
        });

        it("should permit Evaluator or Government to request clarification from UNDER_REVIEW", () => {
            expect(canTransition(SUBMISSION_STATUS.UNDER_REVIEW, SUBMISSION_STATUS.CLARIFICATION)).toBe(true);

            expect(() => {
                assertTransition({
                    fromStatus: SUBMISSION_STATUS.UNDER_REVIEW,
                    toStatus: SUBMISSION_STATUS.CLARIFICATION,
                    actorRole: ROLES.GOVERNMENT_USER,
                });
            }).not.toThrow();

            expect(() => {
                assertTransition({
                    fromStatus: SUBMISSION_STATUS.UNDER_REVIEW,
                    toStatus: SUBMISSION_STATUS.CLARIFICATION,
                    actorRole: ROLES.EVALUATOR,
                });
            }).not.toThrow();
        });

        it("should reject STARTUP_USER from putting themselves into CLARIFICATION", () => {
            expect(() => {
                assertTransition({
                    fromStatus: SUBMISSION_STATUS.SUBMITTED,
                    toStatus: SUBMISSION_STATUS.CLARIFICATION,
                    actorRole: ROLES.STARTUP_USER,
                });
            }).toThrowError(/not permitted to transition/);
        });

        it("should allow STARTUP_USER to respond and return submission to UNDER_REVIEW", () => {
            expect(canTransition(SUBMISSION_STATUS.CLARIFICATION, SUBMISSION_STATUS.UNDER_REVIEW)).toBe(true);
            expect(() => {
                assertTransition({
                    fromStatus: SUBMISSION_STATUS.CLARIFICATION,
                    toStatus: SUBMISSION_STATUS.UNDER_REVIEW,
                    actorRole: ROLES.STARTUP_USER,
                });
            }).not.toThrow();
        });

        it("should allow STARTUP_USER to respond and return submission to SUBMITTED", () => {
            expect(canTransition(SUBMISSION_STATUS.CLARIFICATION, SUBMISSION_STATUS.SUBMITTED)).toBe(true);
            expect(() => {
                assertTransition({
                    fromStatus: SUBMISSION_STATUS.CLARIFICATION,
                    toStatus: SUBMISSION_STATUS.SUBMITTED,
                    actorRole: ROLES.STARTUP_USER,
                });
            }).not.toThrow();
        });

        it("should allow STARTUP_USER to withdraw a proposal during CLARIFICATION", () => {
            expect(canTransition(SUBMISSION_STATUS.CLARIFICATION, SUBMISSION_STATUS.WITHDRAWN)).toBe(true);
            expect(() => {
                assertTransition({
                    fromStatus: SUBMISSION_STATUS.CLARIFICATION,
                    toStatus: SUBMISSION_STATUS.WITHDRAWN,
                    actorRole: ROLES.STARTUP_USER,
                });
            }).not.toThrow();
        });

        it("should forbid illegal transitions from CLARIFICATION directly to ACCEPTED or SCALED", () => {
            expect(canTransition(SUBMISSION_STATUS.CLARIFICATION, SUBMISSION_STATUS.ACCEPTED)).toBe(false);
            expect(canTransition(SUBMISSION_STATUS.CLARIFICATION, SUBMISSION_STATUS.SCALED)).toBe(false);
            expect(canTransition(SUBMISSION_STATUS.CLARIFICATION, SUBMISSION_STATUS.PILOT_ACTIVE)).toBe(false);
        });
    });

    describe("Stage 5: Independent Technical Evaluator Assignment", () => {
        it("should validate a well-formed evaluator assignment payload", () => {
            const validPayload = {
                submissionId: "66f000000000000000000001",
                evaluatorId: "66f000000000000000000002",
                templateId: "66f000000000000000000003",
                deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            };

            const result = createAssignmentSchema.safeParse(validPayload);
            expect(result.success).toBe(true);
        });

        it("should reject assignment payloads with invalid ObjectIds", () => {
            const invalidPayload = {
                submissionId: "invalid-id",
                evaluatorId: "66f000000000000000000002",
                templateId: "66f000000000000000000003",
                deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            };

            const result = createAssignmentSchema.safeParse(invalidPayload);
            expect(result.success).toBe(false);
            expect(result.error.issues[0].message).toContain("Invalid submission ID");
        });

        it("should permit Government Officer and Admin to transition SUBMITTED to UNDER_REVIEW", () => {
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
                    actorRole: ROLES.ADMIN,
                });
            }).not.toThrow();
        });
    });
});
