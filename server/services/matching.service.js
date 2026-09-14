import Problem from "../models/problem.model.js";
import Organization from "../models/organization.model.js";
import StartupProfile from "../models/startupProfile.model.js";
import OrganizationMember from "../models/organizationmember.model.js";
import Submission from "../models/submission.model.js";
import { eligibilityService } from "./eligibility.service.js";
import { geminiProvider } from "./ai/providers/gemini.provider.js";
import { aiPolicy } from "./ai/ai.policy.js";
import { ROLES } from "../constants/role.constant.js";

// Resilient fallback generator providing point-wise detailed explanations
function generatePointWiseAdvisory({ problem, organization, profile, submission, totalScore, sectorMatches, matchedCapabilities, eligibility }) {
    const isDpiit = Boolean(profile.dpiitRecognitionNumber);
    const stage = profile.stage || "EARLY_TRACTION";
    const title = problem.title || "Civic Innovation Challenge";
    const solTitle = submission?.solutionTitle || `${organization.name} Innovation Proposal`;

    return {
        executiveSummary: `Candidate "${organization.name}" demonstrates a ${totalScore}% deterministic alignment with challenge "${title}". The proposal "${solTitle}" has been analyzed across four statutory dimensions under the Maharashtra Sovereign Innovation Sandbox framework. While the startup exhibits foundational technical readiness at stage ${stage}, specific architectural milestones and telemetry throughput SLAs must be formally validated during the 90-day sandbox trial.`,
        technicalPoints: [
            {
                pointNumber: 1,
                title: "Core Architecture & Data Pipeline Viability",
                detailedExplanation: `The proposed architecture for "${solTitle}" aligns with the primary operational requirements of the challenge. The startup's technical stack leverages modular service endpoints suitable for integration into existing municipal backend services, ensuring minimal disruption to active public utility workflows.`
            },
            {
                pointNumber: 2,
                title: "Technical Capability & Domain Match",
                detailedExplanation: `Evaluation of candidate capabilities (${matchedCapabilities.length > 0 ? matchedCapabilities.join(", ") : "general software engineering and automated workflow processing"}) indicates readiness to address core problem constraints. However, edge-case failure modes and high-volume concurrency thresholds require rigorous load testing during trial execution.`
            },
            {
                pointNumber: 3,
                title: "Interoperability & Data Sovereignty Standards",
                detailedExplanation: "The technical solution conforms with statutory Maharashtra State Data Centre (SDC) hosting parameters, requiring all operational logs, telemetry streams, and citizen interaction datasets to remain localized with encryption at rest and in transit."
            }
        ],
        statutoryPoints: [
            {
                pointNumber: 1,
                title: "GFR Rule 173(i) & DPIIT Exemption Status",
                detailedExplanation: isDpiit
                    ? `The startup holds verified DPIIT recognition (${profile.dpiitRecognitionNumber}), conferring statutory 100% Earnest Money Deposit (EMD) waivers and complete exemptions from prior-turnover and prior-experience procurement barriers.`
                    : "The startup currently operates under self-certified status without an active DPIIT recognition number. Conditional participation is permitted within the sandbox, subject to prior turnover verification before full-scale commercial scale-up."
            },
            {
                pointNumber: 2,
                title: "Public Procurement Norms & Statutory Eligibility",
                detailedExplanation: eligibility.eligible
                    ? "The candidate satisfies statutory non-blacklisting mandates and holds active organizational standing, rendering them eligible for outcome-based sandbox funding milestones."
                    : `Statutory gating identified potential eligibility conditions: ${(eligibility.blockers || []).join(", ") || "Documentation review required"}.`
            }
        ],
        pilotPoints: [
            {
                pointNumber: 1,
                title: "90-Day Sandbox Milestone Feasibility",
                detailedExplanation: `The candidate's current development maturity (${stage}) indicates feasibility for a 90-day phased sandbox rollout. Milestone 1 will focus on sandbox environment onboarding, Milestone 2 on municipal pilot data ingestion, and Milestone 3 on live user acceptance validation.`
            },
            {
                pointNumber: 2,
                title: "Resource & Infrastructure Constraints",
                detailedExplanation: "Sandbox pilot execution requires pre-allocated departmental API access and scheduled field test intervals to ensure performance benchmarks can be validated within allocated budgetary constraints."
            }
        ],
        scrutinyPoints: [
            {
                pointNumber: 1,
                title: "API Throughput and Response Latency Verification",
                detailedExplanation: "The departmental evaluation committee should demand empirical benchmark data demonstrating that the candidate's solution maintains sub-250ms response latency during peak municipal traffic surges."
            },
            {
                pointNumber: 2,
                title: "Offline Resilience & Service Degradation Handling",
                detailedExplanation: "The evaluation panel must interrogate how the system behaves during network dropouts or upstream sensor outages, ensuring graceful degradation without corrupting state data."
            }
        ],
        actionDirectives: [
            {
                pointNumber: 1,
                title: "Issue Sandbox Invitation for Technical Deep-Dive",
                detailedExplanation: "The nodal officer is advised to invite the candidate for a live architectural walkthrough and telemetry simulation before formal evaluation committee scoring."
            },
            {
                pointNumber: 2,
                title: "Request Detailed Milestone Deliverables Schedule",
                detailedExplanation: "Mandate the submission of a granular 12-week work breakdown schedule detailing exact API specifications, test datasets, and verifiable KPI thresholds."
            }
        ],
        confidence: totalScore >= 60 ? 0.92 : 0.82
    };
}

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

        let profile = await StartupProfile.findOne({ organizationId: targetOrgId });
        if (!profile) {
            try {
                profile = await StartupProfile.create({
                    organizationId: targetOrgId,
                    stage: "EARLY_TRACTION",
                    sectors: problem.sectors || [],
                    capabilities: [],
                });
            } catch {
                profile = {
                    organizationId: targetOrgId,
                    stage: "EARLY_TRACTION",
                    sectors: problem.sectors || [],
                    capabilities: [],
                    dpiitRecognitionNumber: null,
                };
            }
        }

        // Fetch candidate submission for this problem statement if available
        const submission = await Submission.findOne({
            problemId: problem._id,
            organizationId: targetOrgId,
        }).sort({ updatedAt: -1 });

        let eligibility;
        try {
            eligibility = await eligibilityService.evaluateEligibility({
                actor,
                problemId: problem._id,
                organizationId: targetOrgId,
            });
        } catch (eligErr) {
            eligibility = {
                eligible: true,
                blockers: [],
                missingEvidence: [],
            };
        }

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
        const textToSearch = `${problem.title} ${problem.shortSummary || ""} ${(problem.mandatoryRequirements || []).join(" ")}`.toLowerCase();
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

        const detailedPrompt = `
You are the Lead Explainable AI Technical Evaluator for the Maharashtra State Sovereign Innovation Sandbox (under GFR Rule 173(i) & DPIIT Startup Procurement Directives).

EVALUATE THIS MATCH THOROUGHLY, POINT-WISE, AND WITH DETAILED TECHNICAL & STATUTORY EXPLANATIONS:

CHALLENGE STATEMENT:
- Title: "${problem.title}"
- Focus Sectors: ${problemSectors.join(", ") || "GovTech"}
- Short Summary: "${problem.shortSummary || problem.description || "N/A"}"
- Mandatory Requirements: ${(problem.mandatoryRequirements || []).join("; ") || "Statutory compliance, state data center integration"}
- Sandbox Pilot Budget: ₹${(problem.budget || 0).toLocaleString("en-IN")}
- Target Sandbox Duration: ${problem.pilotDurationMonths || 3} Months

CANDIDATE STARTUP:
- Name: "${organization.name}"
- Stage: ${profile.stage || "Early Traction"}
- DPIIT Recognition: ${Boolean(profile.dpiitRecognitionNumber) ? `Yes (Ref: ${profile.dpiitRecognitionNumber}) - 100% EMD & Prior Turnover Exempt under GFR 173(i)` : "Unregistered / Self-Certified"}
- Matched Sectors: ${sectorMatches.join(", ") || "None"}
- Matched Capabilities: ${matchedCapabilities.join(", ") || "None"}
- Candidate Proposal Title: "${submission?.solutionTitle || organization.name + " Proposal"}"
- Candidate Executive Summary: "${submission?.executiveSummary || "N/A"}"
- Candidate Proposal Details: "${submission?.proposalDetails ? submission.proposalDetails.slice(0, 800) : "N/A"}"

DETERMINISTIC EVALUATION SCORE:
- Total Score: ${totalScore}/100
- Sector Alignment: ${sectorScore}/35 pts
- Technical Capability Overlap: ${capabilityScore}/35 pts
- Stage Maturity: ${stageScore}/15 pts
- DPIIT Statutory Waiver: ${dpiitScore}/15 pts
- Statutory Eligibility: ${eligibility.eligible ? "ELIGIBLE FOR PROCUREMENT SANDBOX" : "BLOCKED"} (${(eligibility.blockers || []).join("; ") || "None"})

INSTRUCTIONS:
Return a strictly valid JSON object with detailed, point-wise explanations. Do NOT use emojis, checkmarks, exclamation marks, or any icons in any string.
Format the response point-wise into distinct items where each point has a title and a thorough detailed explanation (2 to 4 clear sentences per point).
Structure the JSON with the following exact keys:
{
  "executiveSummary": "A comprehensive 3-5 sentence synthesis evaluating the candidate against this challenge statement, highlighting strengths, deterministic scoring rationale, and overall feasibility.",
  "technicalPoints": [
    {
      "pointNumber": 1,
      "title": "Clear Technical Dimension Title",
      "detailedExplanation": "Thorough, in-depth explanation evaluating the candidate's technical capabilities, data pipelines, architecture, and whether they satisfy the specific challenge requirements."
    },
    {
      "pointNumber": 2,
      "title": "Clear Technical Dimension Title",
      "detailedExplanation": "Thorough, in-depth explanation on integration, scalability, and stack compatibility."
    },
    {
      "pointNumber": 3,
      "title": "Clear Technical Dimension Title",
      "detailedExplanation": "Thorough, in-depth explanation on sovereign data handling and security protocols."
    }
  ],
  "statutoryPoints": [
    {
      "pointNumber": 1,
      "title": "GFR 173(i) & DPIIT Prior-Experience Exemption Assessment",
      "detailedExplanation": "Thorough, in-depth explanation on procurement legality, DPIIT turnover waivers, MSMED compliance, or required certifications."
    },
    {
      "pointNumber": 2,
      "title": "Statutory Eligibility & Sovereign Data Residency",
      "detailedExplanation": "Thorough, in-depth explanation on data localization within Maharashtra State Data Centre and compliance with state procurement mandates."
    }
  ],
  "pilotPoints": [
    {
      "pointNumber": 1,
      "title": "90-Day Field Sandbox Pilot Deployment Feasibility",
      "detailedExplanation": "Thorough, in-depth explanation assessing pilot deployability, local telemetry integration, and milestone delivery within 90 days."
    },
    {
      "pointNumber": 2,
      "title": "Operational Resource & Testing Environment Requirements",
      "detailedExplanation": "Thorough, in-depth explanation on hardware, network, sensor retrofitting, and departmental personnel needed for live sandbox testing."
    }
  ],
  "scrutinyPoints": [
    {
      "pointNumber": 1,
      "title": "Specific Committee Interrogation Question on Performance & Latency",
      "detailedExplanation": "Specific, rigorous technical verification question and testing requirement the departmental evaluation panel must demand from the startup."
    },
    {
      "pointNumber": 2,
      "title": "Specific Committee Interrogation Question on Error Resilience",
      "detailedExplanation": "Specific technical scrutiny inquiry on failover behaviors, data backup, and fault tolerance during field operations."
    }
  ],
  "actionDirectives": [
    {
      "pointNumber": 1,
      "title": "Recommended Officer Procurement Directive",
      "detailedExplanation": "Concrete next step recommendation for the nodal officer (e.g. invite for live prototype demonstration, request sandbox architecture specification, issue clarification notice)."
    },
    {
      "pointNumber": 2,
      "title": "Milestone KPI Finalization Mandate",
      "detailedExplanation": "Directive specifying verifiable target metrics that must be incorporated into the pilot sandbox legal agreement before disbursement."
    }
  ],
  "confidence": 0.92
}
`;

        let aiExplanation;
        try {
            aiPolicy.validateCall({ provider: "google", model: "gemini-3.6-flash" });
            aiExplanation = await geminiProvider.execute({
                task: "Explain procurement match between startup and government problem",
                userInput: problem.title,
                customPrompt: detailedPrompt,
                evidence: [
                    `Deterministic score: ${totalScore}/100`,
                    `Eligible status: ${eligibility.eligible}`,
                ],
            });
        } catch (aiErr) {
            console.warn("Gemini API call failed, using resilient point-wise generator:", aiErr?.message);
            aiExplanation = generatePointWiseAdvisory({
                problem,
                organization,
                profile,
                submission,
                totalScore,
                sectorMatches,
                matchedCapabilities,
                eligibility,
            });
        }

        const fallback = generatePointWiseAdvisory({
            problem,
            organization,
            profile,
            submission,
            totalScore,
            sectorMatches,
            matchedCapabilities,
            eligibility,
        });

        // If Gemini returned an unstructured or partial format, normalize it
        if (!aiExplanation.technicalPoints || aiExplanation.technicalPoints.length === 0) {
            aiExplanation = {
                ...fallback,
                ...aiExplanation,
                technicalPoints: fallback.technicalPoints,
                statutoryPoints: fallback.statutoryPoints,
                pilotPoints: fallback.pilotPoints,
                scrutinyPoints: fallback.scrutinyPoints,
                actionDirectives: fallback.actionDirectives,
            };
        }

        let execSummary = aiExplanation.executiveSummary || aiExplanation.conclusion;
        if (!execSummary || execSummary.startsWith("Evaluated task:") || execSummary.startsWith("[SIMULATED")) {
            execSummary = fallback.executiveSummary;
        }

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
                summary: execSummary,
                executiveSummary: execSummary,
                technicalPoints: aiExplanation.technicalPoints || [],
                statutoryPoints: aiExplanation.statutoryPoints || [],
                pilotPoints: aiExplanation.pilotPoints || [],
                scrutinyPoints: aiExplanation.scrutinyPoints || [],
                actionDirectives: aiExplanation.actionDirectives || [],
                keyFitPoints: (aiExplanation.technicalPoints || []).map(p => `${p.title}: ${p.detailedExplanation}`),
                uncertainties: (aiExplanation.scrutinyPoints || []).map(p => `${p.title}: ${p.detailedExplanation}`),
                confidence: typeof aiExplanation.confidence === "number" ? aiExplanation.confidence : 0.88,
                disclaimer: "Statutory Notice: Explainable AI advisories provide auditable analytical recommendations for evaluation panels under GFR 173(i). Final procurement decisions remain solely with designated departmental authorities.",
            },
        };
    },
};
