import Problem from "../models/problem.model.js";
import Organization from "../models/organization.model.js";
import StartupProfile from "../models/startupProfile.model.js";
import OrganizationMember from "../models/organizationmember.model.js";
import { eligibilityService } from "./eligibility.service.js";
import { geminiProvider } from "./ai/providers/gemini.provider.js";
import { aiPolicy } from "./ai/ai.policy.js";
import { ROLES } from "../constants/role.constant.js";

export const matchingService = {
    async matchAndExplain({ actor, problemId, organizationId }) {
        const problem = await Problem.findById(problemId);
        if (!problem) {
            const err = new Error("Problem statement not found");
            err.statusCode = 404;
            err.code = "PROBLEM_NOT_FOUND";
            throw err;
        }

        let targetOrgId = organizationId;
        if (!targetOrgId && actor.role === ROLES.STARTUP_USER) {
            const memberRecord = await OrganizationMember.findOne({
                userId: actor._id,
                status: "ACTIVE",
            });
            if (memberRecord) targetOrgId = memberRecord.organizationId;
        }

        if (!targetOrgId) {
            const err = new Error("Organization ID is required");
            err.statusCode = 400;
            err.code = "ORGANIZATION_REQUIRED";
            throw err;
        }

        const organization = await Organization.findById(targetOrgId);
        if (!organization) {
            const err = new Error("Organization not found");
            err.statusCode = 404;
            err.code = "ORGANIZATION_NOT_FOUND";
            throw err;
        }

        const profile = await StartupProfile.findOne({ organizationId: targetOrgId });
        if (!profile) {
            const err = new Error("Startup profile not found for this organization");
            err.statusCode = 404;
            err.code = "PROFILE_NOT_FOUND";
            throw err;
        }

        const eligibility = eligibilityService.evaluateEligibility({
            problem,
            startupProfile: profile,
            organization,
        });

        let sectorScore = 0;
        const problemSectors = problem.sectors || [];
        const startupSectors = profile.sectors || [];
        const sectorMatches = startupSectors.filter((s) =>
            problemSectors.some((ps) => ps.toLowerCase() === s.toLowerCase())
        );
        if (problemSectors.length > 0) {
            sectorScore = Math.min(35, Math.round((sectorMatches.length / problemSectors.length) * 35));
        }

        let capabilityScore = 0;
        const textToSearch = `${problem.title} ${problem.shortSummary} ${(problem.mandatoryRequirements || []).join(" ")}`.toLowerCase();
        const matchedCapabilities = (profile.capabilities || []).filter((cap) =>
            textToSearch.includes(cap.toLowerCase())
        );
        capabilityScore = Math.min(35, matchedCapabilities.length * 12);

        let stageScore = 0;
        if (["MVP", "EARLY_TRACTION", "SCALING"].includes(profile.stage)) {
            stageScore = 15;
        } else if (profile.stage === "PROTOTYPE") {
            stageScore = 10;
        }

        const dpiitScore = profile.dpiitRecognitionNumber ? 15 : 0;
        const totalScore = sectorScore + capabilityScore + stageScore + dpiitScore;

        const matchContext = `
CHALLENGE: "${problem.title}"
Sector: ${problemSectors.join(", ")}
Requirements: ${(problem.mandatoryRequirements || []).join("; ")}

STARTUP: "${organization.name}"
Stage: ${profile.stage}
Matched Sectors: ${sectorMatches.join(", ") || "None"}
Matched Capabilities: ${matchedCapabilities.join(", ") || "None"}
DPIIT Recognized: ${Boolean(profile.dpiitRecognitionNumber)}
Deterministic Score: ${totalScore}/100
Eligibility: ${eligibility.eligible ? "ELIGIBLE" : "BLOCKED"} (${(eligibility.blockers || []).join("; ")})
`;

        aiPolicy.validateCall({ provider: "google", model: "gemini-3.5-flash-lite" });
        const aiExplanation = await geminiProvider.execute({
            task: "Explain procurement match between startup and government problem",
            userInput: matchContext,
            evidence: [
                `Deterministic score: ${totalScore}/100`,
                `Eligible status: ${eligibility.eligible}`,
            ],
        });

        return {
            problemId: problem._id,
            problemTitle: problem.title,
            organizationId: organization._id,
            organizationName: organization.name,
            deterministicScore: totalScore,
            scoreBreakdown: {
                sectorAlignment: { score: sectorScore, max: 35, matched: sectorMatches },
                capabilityOverlap: { score: capabilityScore, max: 35, matched: matchedCapabilities },
                stageMaturity: { score: stageScore, max: 15, currentStage: profile.stage },
                regulatoryRecognition: { score: dpiitScore, max: 15, hasDpiit: Boolean(profile.dpiitRecognitionNumber) },
            },
            eligibility: {
                eligible: eligibility.eligible,
                blockers: eligibility.blockers,
            },
            aiAdvisory: {
                summary: aiExplanation.conclusion,
                keyFitPoints: aiExplanation.claims,
                uncertainties: aiExplanation.uncertainties,
                confidence: aiExplanation.confidence,
                disclaimer: "AI explanations are advisory recommendations for procurement evaluation panels, not legal approvals.",
            },
        };
    },
};
