export const ROLES = Object.freeze({
    STARTUP_USER: "STARTUP_USER",
    GOVERNMENT_USER: "GOVERNMENT_USER",
    EVALUATOR: "EVALUATOR",
    ADMIN: "ADMIN",
});

export const PERMISSIONS = Object.freeze({
    //Problem domain
    PROBLEM_CREATE: "problem:create",
    PROBLEM_UPDATE: "problem:update",
    PROBLEM_PUBLISH: "problem:publish",
    PROBLEM_VIEW: "problem:view",

    //Submission Domain
    SUBMISSION_CREATE:"submission:create",
    SUBMISSION_VIEW:"submission:view",
    SUBMISSION_REVIEW:"submission:review",

    // Evaluation Domain
    EVALUATION_SCORE: "evaluation:score",
    EVALUATION_DECIDE: "evaluation:decide",

    // Admin & Governance
    ADMIN_CONFIGURE: "admin:configure",
    ADMIN_MODERATE: "admin:moderate",
});


export const ROLE_PERMISSIONS = Object.freeze({
    [ROLES.STARTUP_USER]: [
        PERMISSIONS.PROBLEM_VIEW,
        PERMISSIONS.SUBMISSION_CREATE,
        PERMISSIONS.SUBMISSION_VIEW,
    ],
    [ROLES.GOVERNMENT_USER]: [
        PERMISSIONS.PROBLEM_CREATE,
        PERMISSIONS.PROBLEM_UPDATE,
        PERMISSIONS.PROBLEM_PUBLISH,
        PERMISSIONS.PROBLEM_VIEW,
        PERMISSIONS.SUBMISSION_VIEW,
        PERMISSIONS.EVALUATION_DECIDE,
    ],
    [ROLES.EVALUATOR]: [
        PERMISSIONS.PROBLEM_VIEW,
        PERMISSIONS.SUBMISSION_VIEW,
        PERMISSIONS.EVALUATION_SCORE,
    ],
    // ADMIN has all permissions
    [ROLES.ADMIN]: Object.values(PERMISSIONS),
});

/**
 *  helper to verify permission against role
 * @param {string} userRole 
 * @param {string} permission 
 * @returns {boolean}
 */
export function hasPermission(userRole, permission) {
    if (!userRole || !permission) return false;
    if (userRole === ROLES.ADMIN) return true;
    const permissions = ROLE_PERMISSIONS[userRole] || [];
    return permissions.includes(permission);
}