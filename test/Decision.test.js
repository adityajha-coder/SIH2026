import { describe, it, expect } from "vitest";
import { canTransition, assertTransition } from "../server/services/submission/transitionGuard.js";
import { SUBMISSION_STATUS } from "../server/models/submission.model.js";
import { ROLES } from "../server/constants/role.constant.js";
import { createDecisionSchema } from "../server/validators/evaluation.validator.js";

describe("Phase 4: Statutory Decision & Pilot Award FSM", () => {
    describe("FSM Transitions for Decisions and Compact Signing", () => {
        it("allows UNDER_REVIEW → ACCEPTED for GOVERNMENT_USER and ADMIN", () => {
            expect(canTransition(SUBMISSION_STATUS.UNDER_REVIEW, SUBMISSION_STATUS.ACCEPTED)).toBe(true);

            expect(() => {
                assertTransition({
                    fromStatus: SUBMISSION_STATUS.UNDER_REVIEW,
                    toStatus: SUBMISSION_STATUS.ACCEPTED,
                    actorRole: ROLES.GOVERNMENT_USER,
                });
            }).not.toThrow();

            expect(() => {
                assertTransition({
                    fromStatus: SUBMISSION_STATUS.UNDER_REVIEW,
                    toStatus: SUBMISSION_STATUS.ACCEPTED,
                    actorRole: ROLES.ADMIN,
                });
            }).not.toThrow();
        });

        it("allows UNDER_REVIEW → REJECTED for GOVERNMENT_USER and ADMIN", () => {
            expect(canTransition(SUBMISSION_STATUS.UNDER_REVIEW, SUBMISSION_STATUS.REJECTED)).toBe(true);

            expect(() => {
                assertTransition({
                    fromStatus: SUBMISSION_STATUS.UNDER_REVIEW,
                    toStatus: SUBMISSION_STATUS.REJECTED,
                    actorRole: ROLES.GOVERNMENT_USER,
                });
            }).not.toThrow();
        });

        it("forbids STARTUP_USER from making decisions on UNDER_REVIEW", () => {
            expect(() => {
                assertTransition({
                    fromStatus: SUBMISSION_STATUS.UNDER_REVIEW,
                    toStatus: SUBMISSION_STATUS.ACCEPTED,
                    actorRole: ROLES.STARTUP_USER,
                });
            }).toThrow(/not permitted/);
        });

        it("allows ACCEPTED → PILOT_ACTIVE for STARTUP_USER to accept compact", () => {
            expect(canTransition(SUBMISSION_STATUS.ACCEPTED, SUBMISSION_STATUS.PILOT_ACTIVE)).toBe(true);

            expect(() => {
                assertTransition({
                    fromStatus: SUBMISSION_STATUS.ACCEPTED,
                    toStatus: SUBMISSION_STATUS.PILOT_ACTIVE,
                    actorRole: ROLES.STARTUP_USER,
                });
            }).not.toThrow();
        });

        it("allows PILOT_PROPOSED → PILOT_ACTIVE for STARTUP_USER", () => {
            expect(canTransition(SUBMISSION_STATUS.PILOT_PROPOSED, SUBMISSION_STATUS.PILOT_ACTIVE)).toBe(true);

            expect(() => {
                assertTransition({
                    fromStatus: SUBMISSION_STATUS.PILOT_PROPOSED,
                    toStatus: SUBMISSION_STATUS.PILOT_ACTIVE,
                    actorRole: ROLES.STARTUP_USER,
                });
            }).not.toThrow();
        });

        it("blocks illegal transitions like SUBMITTED → ACCEPTED directly", () => {
            expect(canTransition(SUBMISSION_STATUS.SUBMITTED, SUBMISSION_STATUS.ACCEPTED)).toBe(false);

            expect(() => {
                assertTransition({
                    fromStatus: SUBMISSION_STATUS.SUBMITTED,
                    toStatus: SUBMISSION_STATUS.ACCEPTED,
                    actorRole: ROLES.GOVERNMENT_USER,
                });
            }).toThrow(/Invalid transition/);
        });
    });

    describe("Decision Schema Validation (createDecisionSchema)", () => {
        it("validates a legitimate ACCEPTED decision with statutory rationale", () => {
            const valid = {
                submissionId: "507f1f77bcf86cd799439011",
                outcome: "ACCEPTED",
                rationale: "Selected under Rule 173(i) GFR 2017 following unanimous evaluator recommendation.",
            };
            const result = createDecisionSchema.safeParse(valid);
            expect(result.success).toBe(true);
        });

        it("validates a legitimate REJECTED decision with statutory rationale", () => {
            const valid = {
                submissionId: "507f1f77bcf86cd799439011",
                outcome: "REJECTED",
                rationale: "Does not meet the baseline criteria for data localization within Maharashtra SDC.",
            };
            const result = createDecisionSchema.safeParse(valid);
            expect(result.success).toBe(true);
        });

        it("rejects an invalid outcome", () => {
            const invalid = {
                submissionId: "507f1f77bcf86cd799439011",
                outcome: "PENDING_APPROVAL",
                rationale: "Rationale with sufficient length",
            };
            const result = createDecisionSchema.safeParse(invalid);
            expect(result.success).toBe(false);
        });

        it("rejects when rationale is too short", () => {
            const invalid = {
                submissionId: "507f1f77bcf86cd799439011",
                outcome: "ACCEPTED",
                rationale: "Short",
            };
            const result = createDecisionSchema.safeParse(invalid);
            expect(result.success).toBe(false);
        });
        it("validates a decision with custom grant amount, 3-part split, and PDF attachment", () => {
            const valid = {
                submissionId: "507f1f77bcf86cd799439011",
                outcome: "ACCEPTED",
                rationale: "Selected under Rule 173(i) GFR 2017 following unanimous evaluator recommendation.",
                grantAmount: 3000000,
                paymentDescription: "Disbursed in 3 tranches (30% - 40% - 30%) upon milestone verification.",
                tranches: [
                    {
                        trancheId: "TR-01",
                        name: "Phase 1: Mobilization & Setup",
                        percentage: 30,
                        amount: 900000,
                        deliverable: "Sandbox charter execution, container setup.",
                    },
                    {
                        trancheId: "TR-02",
                        name: "Phase 2: Field Validation",
                        percentage: 40,
                        amount: 1200000,
                        deliverable: "Live operational telemetry across municipal pilot test zones.",
                    },
                    {
                        trancheId: "TR-03",
                        name: "Phase 3: Final Audit & Signoff",
                        percentage: 30,
                        amount: 900000,
                        deliverable: "Final KPI compliance audit, CERT-In cybersecurity certification.",
                    },
                ],
                planDetails: "90-day sandbox pilot across designated pilot zones.",
                durationDays: 90,
                planDocumentUrl: "https://storage.googleapis.com/sih2026/plan.pdf",
                planDocumentName: "Government_Pilot_Sanction_Plan.pdf",
                planDocumentHash: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            };
            const result = createDecisionSchema.safeParse(valid);
            expect(result.success).toBe(true);
        });

        it("allows STARTUP_USER to decline/reject the pilot offer (ACCEPTED → REJECTED)", () => {
            expect(canTransition(SUBMISSION_STATUS.ACCEPTED, SUBMISSION_STATUS.REJECTED)).toBe(true);

            expect(() => {
                assertTransition({
                    fromStatus: SUBMISSION_STATUS.ACCEPTED,
                    toStatus: SUBMISSION_STATUS.REJECTED,
                    actorRole: ROLES.STARTUP_USER,
                });
            }).not.toThrow();
        });
    });
});
