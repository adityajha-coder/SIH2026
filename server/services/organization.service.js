import organizationModel from "../models/organization.model.js";
import organizationMemberModel from "../models/organizationmember.model.js";
import startupProfileModel from "../models/startupProfile.model.js";
import { ROLES } from "../constants/role.constant.js";

export const organizationService = {
    // create new org and assign creator as owner
    async createOrganization({ actor, input }) {
        if (input.type === "STARTUP" && actor.role !== ROLES.STARTUP_USER && actor.role !== ROLES.ADMIN) {
            const error = new Error("Only users with STARTUP_USER role can create a startup organization");
            error.statusCode = 403;
            error.code = "ROLE_FORBIDDEN";
            throw error;
        }

        if (input.type === "GOVERNMENT_DEPT" && actor.role !== ROLES.GOVERNMENT_USER && actor.role !== ROLES.ADMIN) {
            const error = new Error("Only users with GOVERNMENT_USER role can create a government organization");
            error.statusCode = 403;
            error.code = "ROLE_FORBIDDEN";
            throw error;
        }

        // Create Organization
        const organization = await organizationModel.create({
            name: input.name,
            type: input.type,
            state: input.state || "",
            website: input.website || "",
            createdById: actor._id,
        });

        await organizationMemberModel.create({
            organizationId: organization._id,
            userId: actor._id,
            orgRole: "OWNER",
            status: "ACTIVE",
        });

        let startupProfile = null;
        if (organization.type === "STARTUP") {
            startupProfile = await startupProfileModel.create({
                organizationId: organization._id,
            });
        }

        return {
            organization,
            startupProfile,
        };
    },

    // get active user's current organization & profile
    async getMyOrganization({ actor }) {
        const membership = await organizationMemberModel.findOne({
            userId: actor._id,
            status: "ACTIVE",
        }).populate("organizationId");

        if (!membership || !membership.organizationId) {
            return {
                organization: null,
                membership: null,
                profile: null,
            };
        }

        const organization = membership.organizationId;
        let profile = null;
        if (organization.type === "STARTUP") {
            profile = await startupProfileModel.findOne({ organizationId: organization._id });
        }

        return {
            organization,
            membership,
            profile,
        };
    },

    // get org by id and profile
    async getOrganizationById({ actor, organizationId }) {
        const organization = await organizationModel.findById(organizationId);
        if (!organization) {
            const error = new Error("Organization not found");
            error.statusCode = 404;
            error.code = "NOT_FOUND";
            throw error;
        }

        const membership = await organizationMemberModel.findOne({
            organizationId,
            userId: actor._id,
            status: "ACTIVE",
        });

        let profile = null;
        if (organization.type === "STARTUP") {
            profile = await startupProfileModel.findOne({ organizationId });
        }

        return {
            organization,
            membership,
            profile,
        };
    },

    // update profile
    async updateStartupProfile({ actor, organizationId, input }) {
        const membership = await organizationMemberModel.findOne({
            organizationId,
            userId: actor._id,
            status: "ACTIVE",
        });

        const isAuthorized = actor.role === ROLES.ADMIN || (membership && ["OWNER", "ADMIN"].includes(membership.orgRole));

        if (!isAuthorized) {
            const error = new Error("You do not have permission to modify this organization's profile");
            error.statusCode = 403;
            error.code = "PERMISSION_DENIED";
            throw error;
        }

        const updatedProfile = await startupProfileModel.findOneAndUpdate(
            { organizationId },
            { $set: input },
            { new: true, upsert: true }
        );

        return updatedProfile;
    },
};
