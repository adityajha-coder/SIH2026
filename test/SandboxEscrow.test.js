import { describe, it, expect } from "vitest";
import { canTransition, assertTransition } from "../server/services/submission/transitionGuard.js";
import { SUBMISSION_STATUS } from "../server/models/submission.model.js";
import { ROLES } from "../server/constants/role.constant.js";
import {
    initializeEscrowSchema,
    submitEvidenceSchema,
    disburseMilestoneSchema,
    scalePilotSchema,
} from "../server/validators/payment.validator.js";
import { ESCROW_STATUS, TRANCHE_STATUS } from "../server/models/escrow.model.js";

describe("Phase 5: 90-Day Sovereign Sandbox, Milestone Tracking & Treasury Escrow (PFMS)", () => {
    describe("FSM Sandbox & Commercial Scaling Transitions", () => {
        it("allows PILOT_ACTIVE → PILOT_COMPLETED for GOVERNMENT_USER and ADMIN", () => {
            expect(canTransition(SUBMISSION_STATUS.PILOT_ACTIVE, SUBMISSION_STATUS.PILOT_COMPLETED)).toBe(true);

            expect(() => {
                assertTransition({
                    fromStatus: SUBMISSION_STATUS.PILOT_ACTIVE,
                    toStatus: SUBMISSION_STATUS.PILOT_COMPLETED,
                    actorRole: ROLES.GOVERNMENT_USER,
                });
            }).not.toThrow();

            expect(() => {
                assertTransition({
                    fromStatus: SUBMISSION_STATUS.PILOT_ACTIVE,
                    toStatus: SUBMISSION_STATUS.PILOT_COMPLETED,
                    actorRole: ROLES.ADMIN,
                });
            }).not.toThrow();
        });

        it("forbids STARTUP_USER from unilaterally marking pilot completed", () => {
            expect(() => {
                assertTransition({
                    fromStatus: SUBMISSION_STATUS.PILOT_ACTIVE,
                    toStatus: SUBMISSION_STATUS.PILOT_COMPLETED,
                    actorRole: ROLES.STARTUP_USER,
                });
            }).toThrow(/not permitted/);
        });

        it("allows PILOT_COMPLETED → SCALED (Scale-Gate to GeM)", () => {
            expect(canTransition(SUBMISSION_STATUS.PILOT_COMPLETED, SUBMISSION_STATUS.SCALED)).toBe(true);

            expect(() => {
                assertTransition({
                    fromStatus: SUBMISSION_STATUS.PILOT_COMPLETED,
                    toStatus: SUBMISSION_STATUS.SCALED,
                    actorRole: ROLES.GOVERNMENT_USER,
                });
            }).not.toThrow();
        });

        it("forbids jumping from PILOT_ACTIVE directly to SCALED without audit completion", () => {
            expect(canTransition(SUBMISSION_STATUS.PILOT_ACTIVE, SUBMISSION_STATUS.SCALED)).toBe(false);

            expect(() => {
                assertTransition({
                    fromStatus: SUBMISSION_STATUS.PILOT_ACTIVE,
                    toStatus: SUBMISSION_STATUS.SCALED,
                    actorRole: ROLES.GOVERNMENT_USER,
                });
            }).toThrow(/Invalid transition/);
        });
    });

    describe("Sovereign Escrow & Milestone Validators", () => {
        it("validates initializeEscrowSchema with valid ObjectId and grant amount", () => {
            const valid = {
                submissionId: "507f1f77bcf86cd799439011",
                totalGrantAmount: 2500000,
            };
            const result = initializeEscrowSchema.safeParse(valid);
            expect(result.success).toBe(true);
        });

        it("validates submitEvidenceSchema with 64-char SHA-256 hash", () => {
            const valid = {
                submissionId: "507f1f77bcf86cd799439011",
                trancheId: "TR-01",
                name: "Mobilization_Report.pdf",
                size: "2.4 MB",
                hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                description: "Signed sandbox charter and container provisioning log",
            };
            const result = submitEvidenceSchema.safeParse(valid);
            expect(result.success).toBe(true);
        });

        it("rejects evidence upload with invalid SHA-256 hash format", () => {
            const invalid = {
                submissionId: "507f1f77bcf86cd799439011",
                trancheId: "TR-01",
                name: "Test.pdf",
                size: "1 MB",
                hash: "not-a-sha256-hash",
            };
            const result = submitEvidenceSchema.safeParse(invalid);
            expect(result.success).toBe(false);
        });

        it("validates disburseMilestoneSchema with trancheId and remarks", () => {
            const valid = {
                submissionId: "507f1f77bcf86cd799439011",
                trancheId: "TR-02",
                remarks: "Verified field trial across 100 municipal sites under GFR 173(i)",
            };
            const result = disburseMilestoneSchema.safeParse(valid);
            expect(result.success).toBe(true);
        });

        it("validates scalePilotSchema with GeM contract ID and sanction memo", () => {
            const valid = {
                submissionId: "507f1f77bcf86cd799439011",
                gemContractId: "GEM-2026-DIR-99120",
                sanctionMemo: "Sanctioned for commercial procurement on GeM under GFR Rule 173(i) exemption following audited pilot success.",
            };
            const result = scalePilotSchema.safeParse(valid);
            expect(result.success).toBe(true);
        });

        it("validates submitEvidenceSchema when submissionId is omitted from body (passed via URL param)", () => {
            const validWithoutSubmissionId = {
                trancheId: "TR-01",
                name: "Mobilization_Report.pdf",
                size: "2.4 MB",
                hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                description: "Signed sandbox charter and container provisioning log",
            };
            const result = submitEvidenceSchema.safeParse(validWithoutSubmissionId);
            expect(result.success).toBe(true);
        });

        it("rejects scalePilotSchema when GeM contract ID is missing or too short", () => {
            const invalid = {
                submissionId: "507f1f77bcf86cd799439011",
                gemContractId: "G",
                sanctionMemo: "Valid sanction memo",
            };
            const result = scalePilotSchema.safeParse(invalid);
            expect(result.success).toBe(false);
        });

        it("validates disburseMilestoneSchema when submissionId is omitted from body (passed via URL param)", () => {
            const valid = {
                trancheId: "TR-02",
                remarks: "Verified field trial across 100 municipal sites under GFR 173(i)",
            };
            const result = disburseMilestoneSchema.safeParse(valid);
            expect(result.success).toBe(true);
        });
    });

    describe("Tranche Mathematics and Allocation Consistency", () => {
        it("verifies 30% / 40% / 30% tranche distribution for ₹25,00,000 grant", () => {
            const total = 2500000;
            const m1 = Math.round(total * 0.3);
            const m2 = Math.round(total * 0.4);
            const m3 = total - m1 - m2;

            expect(m1).toBe(750000);
            expect(m2).toBe(1000000);
            expect(m3).toBe(750000);
            expect(m1 + m2 + m3).toBe(total);
        });

        it("verifies escrow status constants", () => {
            expect(ESCROW_STATUS.ACTIVE).toBe("ACTIVE");
            expect(ESCROW_STATUS.AUDITED).toBe("AUDITED");
            expect(ESCROW_STATUS.COMPLETED).toBe("COMPLETED");

            expect(TRANCHE_STATUS.PENDING).toBe("PENDING");
            expect(TRANCHE_STATUS.IN_VERIFICATION).toBe("IN_VERIFICATION");
            expect(TRANCHE_STATUS.DISBURSED).toBe("DISBURSED");
        });
    });
});
