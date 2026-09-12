import crypto from "crypto";
import { geminiProvider } from "./providers/gemini.provider.js";
import { groqProvider } from "./providers/groq.provider.js";
import { aiPolicy } from "./ai.policy.js";
import { AIRun, AI_VERDICTS } from "../../models/aiRun.model.js";

export const verificationService = {
    /**
     * Run the multi-model verification pipeline with Anti-Cascade guarantees
     * @param {Object} params
     * @param {Object} params.actor - Authenticated user context
     * @param {string} params.task - Evaluation task description
     * @param {string} params.userInput - Solution / proposal text
     * @param {Array<string>} params.evidence - Canonical document snippets
     * @param {string} params.entityType - 'SUBMISSION' | 'PROBLEM' | 'ORGANIZATION' | 'MATCH'
     * @param {string} params.entityId - Target MongoDB ObjectId
     */
    async verifyProposal({ actor, task, userInput, evidence = [], entityType, entityId }) {
        const startTime = Date.now();

        const cleanInput = aiPolicy.sanitizeInput(userInput);
        const cleanEvidence = evidence.map((e) => aiPolicy.sanitizeInput(e));
        const inputHash = crypto
            .createHash("sha256")
            .update(cleanInput + JSON.stringify(cleanEvidence))
            .digest("hex");

        // Execute Model 1 (Primary Generator: Gemini 2.5 Flash)
        aiPolicy.validateCall({ provider: "google", model: "gemini-2.5-flash" });
        const generatorResult = await geminiProvider.execute({
            task,
            userInput: cleanInput,
            evidence: cleanEvidence,
        });

        // Execute Model 2 (Independent Verifier: Groq LLaMA)
        // ANTI-CASCADE: Model 2 receives original input + canonical evidence + Model 1 findings
        aiPolicy.validateCall({ provider: "groq", model: "llama-3.3-70b-versatile" });
        const verifierInput = `
ORIGINAL PROPOSAL:
${cleanInput}

MODEL 1 (GENERATOR) ANALYSIS:
Conclusion: ${generatorResult.conclusion}
Reported Claims: ${generatorResult.claims.join("; ")}
Identified Uncertainties: ${generatorResult.uncertainties.join("; ")}
`;

        const verifierResult = await groqProvider.execute({
            task: `Verify claims and audit generator findings for: ${task}`,
            userInput: verifierInput,
            evidence: cleanEvidence,
        });

        const disagreements = [];

        if (verifierResult.issues && verifierResult.issues.length > 0) {
            disagreements.push(...verifierResult.issues);
        }

        //final verdict
        let finalVerdict = AI_VERDICTS.PASS;
        if (disagreements.length > 0) {
            finalVerdict = AI_VERDICTS.PASS_WITH_FLAGS;
        }
        if (generatorResult.confidence < 0.6 || verifierResult.confidence < 0.6) {
            finalVerdict = AI_VERDICTS.UNKNOWN;
        }

        const totalLatencyMs = Date.now() - startTime;

        //Auditable AIRun Record
        const aiRun = await AIRun.create({
            task,
            userInputHash: inputHash,
            promptVersion: "1.0",
            verdict: finalVerdict,
            requestedById: actor?._id || null,
            entityType,
            entityId,
            generatorResult,
            verifierResult,
            disagreements,
            totalLatencyMs,
        });

        return {
            runId: aiRun._id,
            verdict: finalVerdict,
            disagreements,
            summary: generatorResult.conclusion,
            auditedClaims: generatorResult.claims,
            flags: verifierResult.uncertainties,
            totalLatencyMs,
            providers: [generatorResult.provider, verifierResult.provider],
        };
    },
};
