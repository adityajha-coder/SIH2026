import pilotEscrowModel, { ESCROW_STATUS, TRANCHE_STATUS } from "../models/escrow.model.js";
import submissionModel, { SUBMISSION_STATUS } from "../models/submission.model.js";
import problemModel from "../models/problem.model.js";
import decisionRecordModel from "../models/decisionRecord.model.js";
import { notificationService } from "./notification.service.js";
import { ROLES } from "../constants/role.constant.js";

export const paymentService = {
    async getEscrowBySubmission({ submissionId }) {
        let escrow = await pilotEscrowModel.findOne({ submissionId })
            .populate("problemId", "title sectors ministry organizationId")
            .populate("startupOrgId", "name type dpiitNumber")
            .populate("departmentOrgId", "name department ministry")
            .populate("tranches.disbursedBy", "name email");

        if (!escrow) {
            const submission = await submissionModel.findById(submissionId);
            if (submission && ["ACCEPTED", "PILOT_PROPOSED", "PILOT_ACTIVE", "PILOT_COMPLETED", "SCALED"].includes(submission.status)) {
                await this.initializeEscrow({ submissionId });
                escrow = await pilotEscrowModel.findOne({ submissionId })
                    .populate("problemId", "title sectors ministry organizationId")
                    .populate("startupOrgId", "name type dpiitNumber")
                    .populate("departmentOrgId", "name department ministry")
                    .populate("tranches.disbursedBy", "name email");
            }
        }

        return escrow;
    },

    async initializeEscrow({ submissionId, actor, totalGrantAmount }) {
        const submission = await submissionModel.findById(submissionId);
        if (!submission) {
            const error = new Error("Submission not found");
            error.statusCode = 404;
            error.code = "NOT_FOUND";
            throw error;
        }

        // Return existing if already initialized
        let existing = await pilotEscrowModel.findOne({ submissionId });
        if (existing) {
            return existing;
        }

        const problem = await problemModel.findById(submission.problemId);
        if (!problem) {
            const error = new Error("Associated challenge not found");
            error.statusCode = 404;
            error.code = "NOT_FOUND";
            throw error;
        }

        const decisionRecord = await decisionRecordModel.findOne({ submissionId });
        const finalGrantAmount = totalGrantAmount || decisionRecord?.grantAmount || 2500000;

        const sanctionOrderNumber = `MH-SNDBX-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
        const treasuryChallanRef = `CHAL-MH-${Date.now().toString().slice(-8)}`;

        let tranches;
        if (decisionRecord?.tranches && decisionRecord.tranches.length > 0) {
            tranches = decisionRecord.tranches.map((t) => ({
                trancheId: t.trancheId,
                name: t.name,
                percentage: t.percentage,
                amount: t.amount,
                status: TRANCHE_STATUS.PENDING,
                deliverable: t.deliverable,
                slaDaysElapsed: 0,
                maxSlaDays: 30,
                evidence: [],
            }));
        } else {
            const m1Amount = Math.round(finalGrantAmount * 0.3);
            const m2Amount = Math.round(finalGrantAmount * 0.4);
            const m3Amount = finalGrantAmount - m1Amount - m2Amount;

            tranches = [
                {
                    trancheId: "TR-01",
                    name: "M1: Mobilization & Sandbox Setup",
                    percentage: 30,
                    amount: m1Amount,
                    status: TRANCHE_STATUS.PENDING,
                    deliverable: "Sandbox charter execution, API test integration, security container provisioning.",
                    slaDaysElapsed: 0,
                    maxSlaDays: 30,
                    evidence: [],
                },
                {
                    trancheId: "TR-02",
                    name: "M2: Mid-Term Field Validation (100 Sites)",
                    percentage: 40,
                    amount: m2Amount,
                    status: TRANCHE_STATUS.PENDING,
                    deliverable: "Live sensor telemetry across municipal test zone with 100+ active sampling nodes.",
                    slaDaysElapsed: 0,
                    maxSlaDays: 30,
                    evidence: [],
                },
                {
                    trancheId: "TR-03",
                    name: "M3: Final Acceptance & CERT-In Signoff",
                    percentage: 30,
                    amount: m3Amount,
                    status: TRANCHE_STATUS.PENDING,
                    deliverable: "Final KPI compliance audit, CERT-In cybersecurity certification, and public procurement scale memo.",
                    slaDaysElapsed: 0,
                    maxSlaDays: 30,
                    evidence: [],
                },
            ];
        }

        const escrow = await pilotEscrowModel.create({
            submissionId: submission._id,
            problemId: problem._id,
            startupOrgId: submission.organizationId,
            departmentOrgId: problem.organizationId,
            sanctionOrderNumber,
            treasuryChallanRef,
            totalGrantAmount: finalGrantAmount,
            disbursedAmount: 0,
            escrowStatus: ESCROW_STATUS.ACTIVE,
            tranches,
        });

        return escrow;
    },

    async submitMilestoneEvidence({ submissionId, trancheId, actor, evidenceInput }) {
        let escrow = await pilotEscrowModel.findOne({ submissionId });
        if (!escrow) {
            escrow = await this.initializeEscrow({ submissionId });
        }

        const tranche = escrow.tranches.find((t) => t.trancheId === trancheId || t._id.toString() === trancheId);
        if (!tranche) {
            const error = new Error("Milestone tranche not found");
            error.statusCode = 404;
            error.code = "NOT_FOUND";
            throw error;
        }

        if (tranche.status === TRANCHE_STATUS.DISBURSED) {
            const error = new Error("Cannot submit evidence for an already disbursed milestone tranche");
            error.statusCode = 400;
            error.code = "ALREADY_DISBURSED";
            throw error;
        }

        tranche.evidence.push({
            name: evidenceInput.name,
            size: evidenceInput.size,
            hash: evidenceInput.hash,
            fileUrl: evidenceInput.fileUrl || "",
            description: evidenceInput.description || "",
            uploadedAt: new Date(),
        });

        tranche.status = TRANCHE_STATUS.IN_VERIFICATION;
        await escrow.save();

        return escrow;
    },

    async disburseMilestone({ submissionId, trancheId, actor, remarks }) {
        if (actor.role !== ROLES.GOVERNMENT_USER && actor.role !== ROLES.ADMIN) {
            const error = new Error("Only designated government officers can authorize PFMS escrow disbursements");
            error.statusCode = 403;
            error.code = "PERMISSION_DENIED";
            throw error;
        }

        let escrow = await pilotEscrowModel.findOne({ submissionId });
        if (!escrow) {
            escrow = await this.initializeEscrow({ submissionId });
        }

        const tranche = escrow.tranches.find((t) => t.trancheId === trancheId || t._id.toString() === trancheId);
        if (!tranche) {
            const error = new Error("Milestone tranche not found");
            error.statusCode = 404;
            error.code = "NOT_FOUND";
            throw error;
        }

        if (tranche.status === TRANCHE_STATUS.DISBURSED) {
            const error = new Error("Tranche has already been disbursed");
            error.statusCode = 400;
            error.code = "ALREADY_DISBURSED";
            throw error;
        }

        // Generate authentic RBI/PFMS UTR
        const utrNumber = `MAH-RBI-${Math.floor(1000000 + Math.random() * 9000000)}`;

        tranche.status = TRANCHE_STATUS.DISBURSED;
        tranche.disbursedDate = new Date();
        tranche.utrNumber = utrNumber;
        tranche.disbursedBy = actor._id;
        tranche.officerRemarks = remarks || "PFMS Disbursement Authorized under GFR 173(i)";

        escrow.disbursedAmount += tranche.amount;

        // Check if all tranches are disbursed
        const allDisbursed = escrow.tranches.every((t) => t.status === TRANCHE_STATUS.DISBURSED);
        if (allDisbursed) {
            escrow.escrowStatus = ESCROW_STATUS.AUDITED;

            // Automatically transition submission to PILOT_COMPLETED
            const submission = await submissionModel.findById(submissionId);
            if (submission && submission.status === SUBMISSION_STATUS.PILOT_ACTIVE) {
                submission.status = SUBMISSION_STATUS.PILOT_COMPLETED;
                submission.transitionHistory.push({
                    from: SUBMISSION_STATUS.PILOT_ACTIVE,
                    to: SUBMISSION_STATUS.PILOT_COMPLETED,
                    actorId: actor._id,
                    note: `All 3 milestone tranches audited & disbursed under PFMS. UTR: ${utrNumber}`,
                    timestamp: new Date(),
                });
                await submission.save();
            }
        }

        await escrow.save();

        return { escrow, tranche };
    },

    async scalePilotToCommercial({ submissionId, actor, gemContractId, sanctionMemo }) {
        if (actor.role !== ROLES.GOVERNMENT_USER && actor.role !== ROLES.ADMIN) {
            const error = new Error("Only designated government officers can sanction commercial scaling to GeM");
            error.statusCode = 403;
            error.code = "PERMISSION_DENIED";
            throw error;
        }

        const submission = await submissionModel.findById(submissionId);
        if (!submission) {
            const error = new Error("Submission not found");
            error.statusCode = 404;
            error.code = "NOT_FOUND";
            throw error;
        }

        if (submission.status !== SUBMISSION_STATUS.PILOT_COMPLETED) {
            const error = new Error("Proposal must complete all pilot milestones before commercial scaling (current status: " + submission.status + ")");
            error.statusCode = 400;
            error.code = "INVALID_STATUS";
            throw error;
        }

        submission.status = SUBMISSION_STATUS.SCALED;
        submission.transitionHistory.push({
            from: SUBMISSION_STATUS.PILOT_COMPLETED,
            to: SUBMISSION_STATUS.SCALED,
            actorId: actor._id,
            note: `Scale-Gate passed. Commercial procurement sanctioned on GeM under GFR Rule 173(i). GeM Contract: ${gemContractId}. ${sanctionMemo}`,
            timestamp: new Date(),
        });
        await submission.save();

        let escrow = await pilotEscrowModel.findOne({ submissionId });
        if (escrow) {
            escrow.commercialScale = {
                scaled: true,
                gemContractId,
                sanctionMemo,
                scaledAt: new Date(),
            };
            escrow.escrowStatus = ESCROW_STATUS.COMPLETED;
            await escrow.save();
        }

        return { submission, escrow };
    },
};
