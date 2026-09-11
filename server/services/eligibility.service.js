import problemModel from "../models/problem.model.js";
import organizationModel from "../models/organization.model.js";
import organizationMemberModel from "../models/organizationmember.model.js";
import startupProfileModel from "../models/startupProfile.model.js";
import {
    checkApplicationWindow,
    checkApplicantType,
    checkDpiitRequirement,
    checkSectorAlignment,
} from "./eligibility/rule.js";

export const eligibilityService = {
    async evaluateEligibility({ actor, problemId, organizationId }) {
        // Fetch Problem
        const problem = await problemModel.findById(problemId);
        if (!problem) {
            const error = new Error("Problem statement not found");
            error.statusCode = 404;
            error.code = "NOT_FOUND";
            throw error;
        }

        let targetOrgId = organizationId;
        if (!targetOrgId) {
            const membership = await organizationMemberModel.findOne({
                userId: actor._id,
                status: "ACTIVE",
            });

            if (!membership) {
                const error = new Error("You must belong to an active organization to check eligibility");
                error.statusCode = 400;
                error.code = "NO_ORGANIZATION";
                throw error;
            }
            targetOrgId = membership.organizationId;
        }

        const organization = await organizationModel.findById(targetOrgId);
        if (!organization) {
            const error = new Error("Organization not found");
            error.statusCode = 404;
            error.code = "NOT_FOUND";
            throw error;
        }

        const startupProfile = await startupProfileModel.findOne({ organizationId: targetOrgId });

        //Run Deterministic Rule Engine
        const blockers = [];
        const missingEvidence = [];
        const matchedRequirements = [];

        const windowCheck = checkApplicationWindow(problem);
        if (!windowCheck.passed) {
            blockers.push(windowCheck.blocker);
        } else {
            matchedRequirements.push("Application window is open and active");
        }

        const typeCheck = checkApplicantType(organization, problem);
        if (!typeCheck.passed) {
            blockers.push(typeCheck.blocker);
        } else {
            matchedRequirements.push(`Applicant entity type (${organization.type}) is eligible`);
        }

        const dpiitCheck = checkDpiitRequirement(startupProfile, problem);
        if (!dpiitCheck.passed) {
            blockers.push(dpiitCheck.blocker);
            if (dpiitCheck.missingEvidence) missingEvidence.push(dpiitCheck.missingEvidence);
        } else if (startupProfile?.dpiitRecognitionNumber) {
            matchedRequirements.push(`DPIIT recognition verified (${startupProfile.dpiitRecognitionNumber})`);
        }

        const sectorCheck = checkSectorAlignment(startupProfile, problem);
        if (sectorCheck.matched && sectorCheck.matchedSectors.length > 0) {
            matchedRequirements.push(`Sector alignment: ${sectorCheck.matchedSectors.join(", ")}`);
        }

        // If any hard blocker exists, eligible is false
        const eligible = blockers.length === 0;

        return {
            problemId: problem._id,
            organizationId: organization._id,
            eligible,
            blockers,
            matchedRequirements,
            missingEvidence,
            scoreInputs: {
                sectorsMatched: sectorCheck.matchedSectors,
                startupStage: startupProfile?.stage || "IDEA",
                hasDpiit: Boolean(startupProfile?.dpiitRecognitionNumber),
            },
        };
    },
};
