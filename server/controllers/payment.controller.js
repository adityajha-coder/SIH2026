import { paymentService } from "../services/payment.service.js";

export const paymentController = {
    async getEscrow(req, res, next) {
        try {
            const submissionId = req.params.submissionId || req.body?.submissionId;
            const escrow = await paymentService.getEscrowBySubmission({ submissionId });
            if (!escrow) {
                return res.status(404).json({
                    success: false,
                    error: { code: "NOT_FOUND", message: "Escrow account not found for this submission" },
                });
            }
            return res.status(200).json({
                success: true,
                data: escrow,
            });
        } catch (err) {
            next(err);
        }
    },

    async initializeEscrow(req, res, next) {
        try {
            const submissionId = req.params.submissionId || req.body?.submissionId;
            const { totalGrantAmount } = req.body;
            const escrow = await paymentService.initializeEscrow({
                submissionId,
                actor: req.user,
                totalGrantAmount,
            });
            return res.status(201).json({
                success: true,
                data: escrow,
            });
        } catch (err) {
            next(err);
        }
    },

    async submitEvidence(req, res, next) {
        try {
            const submissionId = req.params.submissionId || req.body?.submissionId;
            const { trancheId, name, size, hash, fileUrl, description } = req.body;
            const escrow = await paymentService.submitMilestoneEvidence({
                submissionId,
                trancheId,
                actor: req.user,
                evidenceInput: { name, size, hash, fileUrl, description },
            });
            return res.status(200).json({
                success: true,
                data: escrow,
            });
        } catch (err) {
            next(err);
        }
    },

    async disburseMilestone(req, res, next) {
        try {
            const submissionId = req.params.submissionId || req.body?.submissionId;
            const { trancheId, remarks } = req.body;
            const result = await paymentService.disburseMilestone({
                submissionId,
                trancheId,
                actor: req.user,
                remarks,
            });
            return res.status(200).json({
                success: true,
                data: result,
            });
        } catch (err) {
            next(err);
        }
    },

    async scalePilot(req, res, next) {
        try {
            const submissionId = req.params.submissionId || req.body?.submissionId;
            const { gemContractId, sanctionMemo } = req.body;
            const result = await paymentService.scalePilotToCommercial({
                submissionId,
                actor: req.user,
                gemContractId,
                sanctionMemo,
            });
            return res.status(200).json({
                success: true,
                data: result,
            });
        } catch (err) {
            next(err);
        }
    },
};
