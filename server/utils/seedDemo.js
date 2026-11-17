import bcrypt from "bcrypt";
import connectDB from "../config/db.js";
import userModel from "../models/user.model.js";
import organizationMemberModel from "../models/organizationmember.model.js";
import organizationModel from "../models/organization.model.js";
import evaluationAssignmentModel, { ASSIGNMENT_STATUS } from "../models/evaluationAssignment.model.js";
import evaluationTemplateModel from "../models/evaluationTemplate.model.js";
import submissionModel from "../models/submission.model.js";
import { ROLES } from "../constants/role.constant.js";

export const DEMO_PASSWORD = "DemoJudge@2026";

export const DEMO_USERS = [
  {
    userName: "demo_startup",
    email: "demo.startup@pragati-govx.gov.in",
    role: ROLES.STARTUP_USER,
    orgType: "STARTUP",
    preferredOrgName: "Aadilazy",
  },
  {
    userName: "demo_government",
    email: "demo.government@pragati-govx.gov.in",
    role: ROLES.GOVERNMENT_USER,
    orgType: "GOVERNMENT_DEPT",
    preferredOrgName: "DRDO",
  },
  {
    userName: "demo_evaluator",
    email: "demo.evaluator@pragati-govx.gov.in",
    role: ROLES.EVALUATOR,
  },
];

export async function seedDemoAccounts() {
  await connectDB();

  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 12);
  const createdOrUpdatedUsers = {};

  for (const demoData of DEMO_USERS) {
    const emailNormalized = demoData.email.toLowerCase().trim();
    let user = await userModel.findOne({ emailNormalized });

    if (!user) {
      user = await userModel.create({
        userName: demoData.userName,
        email: demoData.email,
        emailNormalized,
        password: hashedPassword,
        role: demoData.role,
        status: "ACTIVE",
        verified: true,
        emailVerifiedAt: new Date(),
        authProvider: "local",
      });
      console.log(`Created demo user: ${demoData.email} (${demoData.role})`);
    } else {
      user.password = hashedPassword;
      user.verified = true;
      user.status = "ACTIVE";
      user.emailVerifiedAt = user.emailVerifiedAt || new Date();
      await user.save();
      console.log(`Updated demo user: ${demoData.email} (${demoData.role})`);
    }

    createdOrUpdatedUsers[demoData.role] = user;

    // Link organizations for Startup and Government users
    if (demoData.preferredOrgName) {
      let org = await organizationModel.findOne({ name: demoData.preferredOrgName });
      if (!org && demoData.orgType) {
        org = await organizationModel.findOne({ type: demoData.orgType });
      }

      if (org) {
        const existingMember = await organizationMemberModel.findOne({
          organizationId: org._id,
          userId: user._id,
        });

        if (!existingMember) {
          await organizationMemberModel.create({
            organizationId: org._id,
            userId: user._id,
            orgRole: "OWNER",
            status: "ACTIVE",
          });
          console.log(`Added ${user.email} as OWNER to organization ${org.name}`);
        } else if (existingMember.status !== "ACTIVE" || existingMember.orgRole !== "OWNER") {
          existingMember.status = "ACTIVE";
          existingMember.orgRole = "OWNER";
          await existingMember.save();
          console.log(`Updated membership for ${user.email} in ${org.name}`);
        }
      }
    }
  }

  // Ensure demo evaluator has at least one assignment to test
  const evaluatorUser = createdOrUpdatedUsers[ROLES.EVALUATOR];
  if (evaluatorUser) {
    const existingAssignment = await evaluationAssignmentModel.findOne({
      evaluatorId: evaluatorUser._id,
    });

    if (!existingAssignment) {
      // Find a template and a submission to assign
      const template = await evaluationTemplateModel.findOne({ status: "ACTIVE" });
      const submission = await submissionModel.findOne({ status: { $in: ["ACCEPTED", "UNDER_REVIEW", "PENDING"] } })
        || await submissionModel.findOne();

      if (template && submission) {
        const govUser = createdOrUpdatedUsers[ROLES.GOVERNMENT_USER];
        await evaluationAssignmentModel.create({
          submissionId: submission._id,
          evaluatorId: evaluatorUser._id,
          templateId: template._id,
          assignedById: govUser ? govUser._id : evaluatorUser._id,
          status: ASSIGNMENT_STATUS.PENDING,
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        });
        console.log(`Created sample evaluation assignment for demo evaluator.`);
      }
    }
  }

  console.log("Demo accounts seeded successfully!");
}

// Allow standalone execution
if (process.argv[1]?.endsWith("seedDemo.js")) {
  seedDemoAccounts()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Failed to seed demo accounts:", err);
      process.exit(1);
    });
}

