import crypto from "crypto";
import path from "path";
import { Evidence, ENTITY_TYPES, EVIDENCE_STATUS } from "../models/evidence.model.js";
import Submission from "../models/submission.model.js";
import OrganizationMember from "../models/organizationmember.model.js";
import StartupProfile from "../models/startupProfile.model.js";
import Problem from "../models/problem.model.js";
import { storageService } from "./storage.service.js";
import { ROLES } from "../constants/role.constant.js";

export const evidenceService = {
    async createUploadIntent({ actor, input }) {
        const { fileName, mimeType, sizeBytes, entityType, entityId } = input;

        if (entityType === ENTITY_TYPES.SUBMISSION) {
            const submission = await Submission.findById(entityId);
            if (!submission) {
                const err = new Error("Submission not found");
                err.statusCode = 404;
                err.code = "SUBMISSION_NOT_FOUND";
                throw err;
            }

            if (actor.role !== ROLES.ADMIN) {
                const isMember = await OrganizationMember.findOne({
                    organizationId: submission.organizationId,
                    userId: actor._id,
                    status: "ACTIVE",
                });
                if (!isMember) {
                    const err = new Error("You do not have permission to attach files to this submission");
                    err.statusCode = 403;
                    err.code = "FORBIDDEN";
                    throw err;
                }
            }
        } else if (entityType === ENTITY_TYPES.ORGANIZATION) {
            // Organization profile documents (e.g. DPIIT certificate)
            if (actor.role !== ROLES.ADMIN) {
                const isOrgAdmin = await OrganizationMember.findOne({
                    organizationId: entityId,
                    userId: actor._id,
                    orgRole: { $in: ["OWNER", "ADMIN", "MEMBER"] },
                    status: "ACTIVE",
                });
                if (!isOrgAdmin) {
                    const err = new Error("Only organization members can upload organization evidence");
                    err.statusCode = 403;
                    err.code = "FORBIDDEN";
                    throw err;
                }
            }
        } else if (entityType === ENTITY_TYPES.PROBLEM) {
            const problem = await Problem.findById(entityId);
            if (!problem) {
                const err = new Error("Problem statement not found");
                err.statusCode = 404;
                err.code = "PROBLEM_NOT_FOUND";
                throw err;
            }
            if (actor.role !== ROLES.ADMIN) {
                const isGovMember = await OrganizationMember.findOne({
                    organizationId: problem.organizationId,
                    userId: actor._id,
                    status: "ACTIVE",
                });
                if (!isGovMember) {
                    const err = new Error("Only problem authoring department members can upload problem attachments");
                    err.statusCode = 403;
                    err.code = "FORBIDDEN";
                    throw err;
                }
            }
        }

        const ext = path.extname(fileName) || "";
        const sanitizedExt = ext.replace(/[^a-zA-Z0-9.]/g, "").slice(0, 10);
        const fileKey = `evidence/${entityType.toLowerCase()}/${Date.now()}-${crypto.randomUUID()}${sanitizedExt}`;

        const evidence = await Evidence.create({
            fileKey,
            fileName,
            mimeType,
            sizeBytes,
            uploadedById: actor._id,
            entityType,
            entityId,
            status: EVIDENCE_STATUS.PENDING_UPLOAD,
        });

        const presigned = await storageService.getUploadPresignedUrl({
            fileKey,
            mimeType,
            maxSizeBytes: sizeBytes,
            expirySeconds: 900, // 15 minutes
        });

        return {
            evidenceId: evidence._id,
            fileKey: evidence.fileKey,
            uploadUrl: presigned.uploadUrl,
            method: presigned.method,
            headers: presigned.headers,
            expiresInSeconds: presigned.expiresInSeconds,
            isMock: presigned.isMock,
        };
    },

    async finalizeUpload({ actor, evidenceId, input = {} }) {
        const evidence = await Evidence.findById(evidenceId);
        if (!evidence) {
            const err = new Error("Evidence record not found");
            err.statusCode = 404;
            err.code = "EVIDENCE_NOT_FOUND";
            throw err;
        }

        if (actor.role !== ROLES.ADMIN && evidence.uploadedById.toString() !== actor._id.toString()) {
            const err = new Error("You are not authorized to finalize this upload");
            err.statusCode = 403;
            err.code = "FORBIDDEN";
            throw err;
        }

        evidence.status = EVIDENCE_STATUS.UPLOADED;
        if (input.checksumSHA256) evidence.checksumSHA256 = input.checksumSHA256;
        if (input.actualSizeBytes) evidence.sizeBytes = input.actualSizeBytes;
        await evidence.save();

        if (evidence.entityType === ENTITY_TYPES.SUBMISSION) {
            await Submission.findByIdAndUpdate(evidence.entityId, {
                $addToSet: { evidenceFileIds: evidence._id.toString() },
            });
        } else if (evidence.entityType === ENTITY_TYPES.ORGANIZATION) {
            await StartupProfile.findOneAndUpdate(
                { organizationId: evidence.entityId },
                { $addToSet: { evidenceRefs: evidence._id.toString() } }
            );
        }

        return evidence;
    },

    async getEvidenceById({ actor, evidenceId }) {
        const evidence = await Evidence.findById(evidenceId);
        if (!evidence) {
            const err = new Error("Evidence not found");
            err.statusCode = 404;
            err.code = "EVIDENCE_NOT_FOUND";
            throw err;
        }

        const presigned = await storageService.getDownloadPresignedUrl({
            fileKey: evidence.fileKey,
            expirySeconds: 1800, // 30 mins
        });

        return {
            ...evidence.toObject(),
            downloadUrl: presigned.downloadUrl,
            expiresInSeconds: presigned.expiresInSeconds,
        };
    },

    async listEvidenceByEntity({ actor, entityType, entityId }) {
        const records = await Evidence.find({
            entityType,
            entityId,
            status: { $in: [EVIDENCE_STATUS.UPLOADED, EVIDENCE_STATUS.VERIFIED] },
        }).sort({ createdAt: -1 });

        return Promise.all(
            records.map(async (doc) => {
                const { downloadUrl } = await storageService.getDownloadPresignedUrl({
                    fileKey: doc.fileKey,
                    expirySeconds: 1800,
                });
                return {
                    ...doc.toObject(),
                    downloadUrl,
                };
            })
        );
    },
};
