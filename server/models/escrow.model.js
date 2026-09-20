import mongoose from "mongoose";

export const ESCROW_STATUS = Object.freeze({
    ALLOCATED: "ALLOCATED",
    ACTIVE: "ACTIVE",
    AUDITED: "AUDITED",
    COMPLETED: "COMPLETED",
    CLOSED: "CLOSED",
});

export const TRANCHE_STATUS = Object.freeze({
    PENDING: "PENDING",
    SUBMITTED: "SUBMITTED",
    IN_VERIFICATION: "IN_VERIFICATION",
    APPROVED: "APPROVED",
    DISBURSED: "DISBURSED",
    REJECTED: "REJECTED",
});

const evidenceSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    size: { type: String, required: true },
    hash: { type: String, required: true, trim: true }, // sha256:....
    fileUrl: { type: String, default: "" },
    description: { type: String, trim: true, default: "" },
    uploadedAt: { type: Date, default: Date.now },
}, { _id: true });

const trancheSchema = new mongoose.Schema({
    trancheId: { type: String, required: true }, // e.g. TR-01, TR-02, TR-03
    name: { type: String, required: true, trim: true },
    percentage: { type: Number, required: true, min: 1, max: 100 },
    amount: { type: Number, required: true, min: 0 },
    status: {
        type: String,
        enum: Object.values(TRANCHE_STATUS),
        default: TRANCHE_STATUS.PENDING,
    },
    deliverable: { type: String, required: true, trim: true },
    slaDaysElapsed: { type: Number, default: 0 },
    maxSlaDays: { type: Number, default: 30 },
    evidence: [evidenceSchema],
    disbursedDate: { type: Date, default: null },
    utrNumber: { type: String, default: null, trim: true },
    disbursedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users", default: null },
    officerRemarks: { type: String, default: "", trim: true },
}, { _id: true });

const pilotEscrowSchema = new mongoose.Schema({
    submissionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "submissions",
        required: true,
        unique: true,
        index: true,
    },
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "problems",
        required: true,
        index: true,
    },
    startupOrgId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "organizations",
        required: true,
    },
    departmentOrgId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "organizations",
        required: true,
    },

    sanctionOrderNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    totalGrantAmount: {
        type: Number,
        required: true,
        default: 2500000,
    },
    disbursedAmount: {
        type: Number,
        required: true,
        default: 0,
    },
    escrowStatus: {
        type: String,
        enum: Object.values(ESCROW_STATUS),
        default: ESCROW_STATUS.ACTIVE,
    },

    // Sovereign Treasury / PFMS Attributes
    majorHead: {
        type: String,
        default: "2852 - Industries & Commerce",
    },
    accountHead: {
        type: String,
        default: "Grant-in-Aid under Rule 173(i) GFR 2017",
    },
    ddoCode: {
        type: String,
        default: "DDO-MH-ELEC-401",
    },
    treasuryChallanRef: {
        type: String,
        required: true,
        trim: true,
    },

    tranches: [trancheSchema],

    commercialScale: {
        scaled: { type: Boolean, default: false },
        gemContractId: { type: String, default: null, trim: true },
        sanctionMemo: { type: String, default: null, trim: true },
        scaledAt: { type: Date, default: null },
    },
}, {
    timestamps: true,
});

const pilotEscrowModel = mongoose.model("pilot_escrows", pilotEscrowSchema);

export default pilotEscrowModel;
