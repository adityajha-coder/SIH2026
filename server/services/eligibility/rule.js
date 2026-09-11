import { PROBLEM_STATUS } from "../../models/problem.model.js";

//Rule 1: Application Window Gate
export function checkApplicationWindow(problem, now = new Date()) {
    // Problem must be published or accepting submissions
    const allowedStatuses = [PROBLEM_STATUS.PUBLISHED, PROBLEM_STATUS.ACCEPTING];
    if (!allowedStatuses.includes(problem.status)) {
        return {
            passed: false,
            blocker: `Problem is currently in '${problem.status}' status and is not accepting submissions.`,
        };
    }

    if (problem.applicationOpenAt && new Date(problem.applicationOpenAt) > now) {
        return {
            passed: false,
            blocker: `Applications open on ${new Date(problem.applicationOpenAt).toLocaleDateString()}.`,
        };
    }

    if (problem.applicationCloseAt && new Date(problem.applicationCloseAt) < now) {
        return {
            passed: false,
            blocker: `Application window closed on ${new Date(problem.applicationCloseAt).toLocaleDateString()}.`,
        };
    }

    return { passed: true, blocker: null };
}

 //Rule 2: Applicant Type Gate
export function checkApplicantType(organization, problem) {
    if (!problem.eligibleApplicantTypes || problem.eligibleApplicantTypes.length === 0) {
        return { passed: true, blocker: null };
    }

    const isEligible = problem.eligibleApplicantTypes.includes(organization.type);
    if (!isEligible) {
        return {
            passed: false,
            blocker: `Organization type '${organization.type}' is not eligible. Allowed types: ${problem.eligibleApplicantTypes.join(", ")}.`,
        };
    }

    return { passed: true, blocker: null };
}

//Rule 3: DPIIT Recognition Gate
export function checkDpiitRequirement(startupProfile, problem) {
    const requiresDpiit = (problem.mandatoryRequirements || []).some(
        (req) => req.toLowerCase().includes("dpiit") || req.toLowerCase().includes("startup india")
    );

    if (requiresDpiit) {
        if (!startupProfile || !startupProfile.dpiitRecognitionNumber) {
            return {
                passed: false,
                missingEvidence: "DPIIT Recognition Certificate / Number is required for this challenge.",
                blocker: "Missing valid DPIIT recognition number in startup profile.",
            };
        }
    }

    return { passed: true, blocker: null, missingEvidence: null };
}

 //Rule 4: Sector Alignment (Soft Match)
export function checkSectorAlignment(startupProfile, problem) {
    if (!problem.sectors || problem.sectors.length === 0) {
        return { matched: true, matchedSectors: [] };
    }

    const startupSectors = (startupProfile?.sectors || []).map((s) => s.toLowerCase());
    const matchedSectors = problem.sectors.filter((sec) => startupSectors.includes(sec.toLowerCase()));

    return {
        matched: matchedSectors.length > 0,
        matchedSectors,
    };
}
