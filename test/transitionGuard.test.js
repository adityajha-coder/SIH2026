import { describe, it, expect } from "vitest";
import { canTransition, assertTransition } from "../server/services/submission/transitionGuard.js";
import { SUBMISSION_STATUS } from "../server/models/submission.model.js";
import { ROLES } from "../server/constants/role.constant.js";

describe("FSM Submission Transition Guard", () => {
    describe("canTransition (State Machine Boundaries)", () => {
        it("should permit legal forward transitions", () => {
            expect(canTransition(SUBMISSION_STATUS.DRAFT, SUBMISSION_STATUS.SUBMITTED)).toBe(true);
            expect(canTransition(SUBMISSION_STATUS.SUBMITTED, SUBMISSION_STATUS.UNDER_REVIEW)).toBe(true);
            expect(canTransition(SUBMISSION_STATUS.UNDER_REVIEW, SUBMISSION_STATUS.ACCEPTED)).toBe(true);
            expect(canTransition(SUBMISSION_STATUS.ACCEPTED, SUBMISSION_STATUS.PILOT_PROPOSED)).toBe(true);
            expect(canTransition(SUBMISSION_STATUS.PILOT_PROPOSED, SUBMISSION_STATUS.PILOT_ACTIVE)).toBe(true);
            expect(canTransition(SUBMISSION_STATUS.PILOT_ACTIVE, SUBMISSION_STATUS.PILOT_COMPLETED)).toBe(true);
            expect(canTransition(SUBMISSION_STATUS.PILOT_COMPLETED, SUBMISSION_STATUS.SCALED)).toBe(true);
        });

        it("should reject illegal state skips", () => {
            expect(canTransition(SUBMISSION_STATUS.DRAFT, SUBMISSION_STATUS.PILOT_ACTIVE)).toBe(false);
            expect(canTransition(SUBMISSION_STATUS.DRAFT, SUBMISSION_STATUS.SCALED)).toBe(false);
            expect(canTransition(SUBMISSION_STATUS.SUBMITTED, SUBMISSION_STATUS.SCALED)).toBe(false);
            expect(canTransition(SUBMISSION_STATUS.ACCEPTED, SUBMISSION_STATUS.SCALED)).toBe(false);
        });

        it("should reject illegal backward transitions", () => {
            expect(canTransition(SUBMISSION_STATUS.PILOT_ACTIVE, SUBMISSION_STATUS.DRAFT)).toBe(false);
            expect(canTransition(SUBMISSION_STATUS.SCALED, SUBMISSION_STATUS.SUBMITTED)).toBe(false);
        });
    });

    describe("assertTransition (Role Authorization & Security)", () => {
        it("should allow STARTUP_USER to transition from DRAFT to SUBMITTED", () => {
            expect(() => {
                assertTransition({
                    fromStatus: SUBMISSION_STATUS.DRAFT,
                    toStatus: SUBMISSION_STATUS.SUBMITTED,
                    actorRole: ROLES.STARTUP_USER,
                });
            }).not.toThrow();
        });

        it("should allow ADMIN to transition any valid state", () => {
            expect(() => {
                assertTransition({
                    fromStatus: SUBMISSION_STATUS.UNDER_REVIEW,
                    toStatus: SUBMISSION_STATUS.ACCEPTED,
                    actorRole: ROLES.ADMIN,
                });
            }).not.toThrow();
        });

        it("should prevent STARTUP_USER from accepting their own submission", () => {
            expect(() => {
                assertTransition({
                    fromStatus: SUBMISSION_STATUS.UNDER_REVIEW,
                    toStatus: SUBMISSION_STATUS.ACCEPTED,
                    actorRole: ROLES.STARTUP_USER,
                });
            }).toThrowError(/not permitted to transition/);
        });

        it("should throw 400 INVALID_TRANSITION when attempting an illegal jump", () => {
            try {
                assertTransition({
                    fromStatus: SUBMISSION_STATUS.DRAFT,
                    toStatus: SUBMISSION_STATUS.SCALED,
                    actorRole: ROLES.ADMIN,
                });
                expect.unreachable("Should have thrown an error");
            } catch (err) {
                expect(err.statusCode).toBe(400);
                expect(err.code).toBe("INVALID_TRANSITION");
            }
        });

        it("should throw 403 TRANSITION_FORBIDDEN when role is unauthorized", () => {
            try {
                assertTransition({
                    fromStatus: SUBMISSION_STATUS.SUBMITTED,
                    toStatus: SUBMISSION_STATUS.UNDER_REVIEW,
                    actorRole: ROLES.STARTUP_USER,
                });
                expect.unreachable("Should have thrown an error");
            } catch (err) {
                expect(err.statusCode).toBe(403);
                expect(err.code).toBe("TRANSITION_FORBIDDEN");
            }
        });
    });
});
