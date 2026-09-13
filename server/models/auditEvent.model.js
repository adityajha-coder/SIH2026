import mongoose from "mongoose";

export const AUDIT_ACTIONS = Object.freeze({
    // Auth & Identity
    USER_REGISTER: "USER_REGISTER",
    USER_LOGIN: "USER_LOGIN",
    USER_ROLE_CHANGED: "USER_ROLE_CHANGED",

    // Organizations
    ORG_CREATED: "ORG_CREATED",
    ORG_VERIFIED: "ORG_VERIFIED",
    ORG_MEMBER_ROLE_UPDATED: "ORG_MEMBER_ROLE_UPDATED",

    // Problems
    PROBLEM_CREATED: "PROBLEM_CREATED",
    PROBLEM_PUBLISHED: "PROBLEM_PUBLISHED",
    PROBLEM_STATUS_CHANGED: "PROBLEM_STATUS_CHANGED",

    // Submissions
    SUBMISSION_CREATED: "SUBMISSION_CREATED",
    SUBMISSION_STATUS_TRANSITIONED: "SUBMISSION_STATUS_TRANSITIONED",

    // Evaluations & Decisions
    EVALUATION_TEMPLATE_CREATED: "EVALUATION_TEMPLATE_CREATED",
    EVALUATION_ASSIGNED: "EVALUATION_ASSIGNED",
    EVALUATION_SCORED: "EVALUATION_SCORED",
    DECISION_RELEASED: "DECISION_RELEASED",

    // Evidence & AI
    EVIDENCE_UPLOAD_INTENT: "EVIDENCE_UPLOAD_INTENT",
    EVIDENCE_ACCESSED: "EVIDENCE_ACCESSED",
    AI_VERIFICATION_RUN: "AI_VERIFICATION_RUN",
});

export const AUDIT_ENTITY_TYPES = Object.freeze({
    USER: "USER",
    ORGANIZATION: "ORGANIZATION",
    PROBLEM: "PROBLEM",
    SUBMISSION: "SUBMISSION",
    EVALUATION_TEMPLATE: "EVALUATION_TEMPLATE",
    EVALUATION_ASSIGNMENT: "EVALUATION_ASSIGNMENT",
    DECISION_RECORD: "DECISION_RECORD",
    EVIDENCE: "EVIDENCE",
    AI_RUN: "AI_RUN",
    SYSTEM: "SYSTEM",
});

const auditEventSchema = new mongoose.Schema(
    {
        actorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null, // null for anonymous / system events
        },
        actorRole: {
            type: String,
            default: "SYSTEM",
        },
        action: {
            type: String,
            required: true,
            enum: Object.values(AUDIT_ACTIONS),
        },
        entityType: {
            type: String,
            required: true,
            enum: Object.values(AUDIT_ENTITY_TYPES),
        },
        entityId: {
            type: String,
            required: true,
        },
        traceId: {
            type: String,
            default: null,
        },
        ip: {
            type: String,
            default: null,
        },
        userAgent: {
            type: String,
            default: null,
        },
        status: {
            type: String,
            enum: ["SUCCESS", "FAILURE", "ATTEMPTED"],
            default: "SUCCESS",
        },
        changes: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    { timestamps: { createdAt: true, updatedAt: false } } // Immutable: only createdAt
);

auditEventSchema.index({ actorId: 1, createdAt: -1 });
auditEventSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
auditEventSchema.index({ action: 1, createdAt: -1 });
auditEventSchema.index({ createdAt: -1 });

const AuditEvent = mongoose.model("AuditEvent", auditEventSchema);
export default AuditEvent;
