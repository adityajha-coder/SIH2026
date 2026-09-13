import crypto from "crypto";
import { geminiProvider } from "./providers/gemini.provider.js";
import { groqProvider } from "./providers/groq.provider.js";
import { openrouterProvider } from "./providers/openrouter.provider.js";
import { ollamaProvider } from "./providers/ollama.provider.js";
import { aiPolicy } from "./ai.policy.js";
import { AIRun, AI_VERDICTS } from "../../models/aiRun.model.js";

export const verificationService = {
    /**
     * Complete 3-Layer Verification Pipeline with Anti-Cascade Rule:
     * Model 1 (Gemini) -> Model 2 (Groq) -> Model 3 (OpenRouter) -> Model 4 (Ollama Fallback)
     */
    async verifyProposal({ actor, task, userInput, evidence = [], entityType, entityId }) {
        const startTime = Date.now();

        const cleanInput = aiPolicy.sanitizeInput(userInput);
        const cleanEvidence = evidence.map((e) => aiPolicy.sanitizeInput(e));
        const inputHash = crypto
            .createHash("sha256")
            .update(cleanInput + JSON.stringify(cleanEvidence))
            .digest("hex");

        // LAYER 1: Generator (Gemini 3.5 Flash Lite)
        aiPolicy.validateCall({ provider: "google", model: "gemini-3.5-flash-lite" });
        let generatorResult;
        try {
            generatorResult = await geminiProvider.execute({
                task,
                userInput: cleanInput,
                evidence: cleanEvidence,
            });
        } catch (err) {
            console.warn("⚠️ Layer 1 failed, calling Model 4 fallback:", err.message);
            generatorResult = await ollamaProvider.execute({ task, userInput: cleanInput, evidence: cleanEvidence });
        }

        // LAYER 2: Independent Verifier (Groq)
        // ANTI-CASCADE: Receives original input + evidence + Model 1 output
        aiPolicy.validateCall({ provider: "groq", model: "openai/gpt-oss-20b" });
        const verifierInput = `
ORIGINAL PROPOSAL:
${cleanInput}

LAYER 1 (GENERATOR) FINDINGS:
Conclusion: ${generatorResult.conclusion}
Reported Claims: ${generatorResult.claims.join("; ")}
Identified Uncertainties: ${generatorResult.uncertainties.join("; ")}
`;

        let verifierResult;
        try {
            verifierResult = await groqProvider.execute({
                task: `Verify claims and audit generator findings for: ${task}`,
                userInput: verifierInput,
                evidence: cleanEvidence,
            });
        } catch (err) {
            console.warn("!! Layer 2 failed, calling Model 4 fallback:", err.message);
            verifierResult = await ollamaProvider.execute({ task, userInput: verifierInput, evidence: cleanEvidence });
        }

        // LAYER 3: Diversity Auditor (OpenRouter)
        // ANTI-CASCADE: Receives original input + evidence + Model 1 + Model 2 outputs
        aiPolicy.validateCall({ provider: "openrouter", model: "liquid/lfm-2.5-2.6b:free" });
        const auditorInput = `
ORIGINAL PROPOSAL:
${cleanInput}

LAYER 1 (GEMINI) CONCLUSION:
${generatorResult.conclusion}

LAYER 2 (GROQ VERIFIER) ASSESSMENT:
${verifierResult.conclusion}
Reported Issues: ${(verifierResult.issues || []).join("; ") || "None"}
`;

        let auditorResult;
        try {
            auditorResult = await openrouterProvider.execute({
                task: `Perform third-party diversity audit on consensus for: ${task}`,
                userInput: auditorInput,
                evidence: cleanEvidence,
            });
        } catch (err) {
            console.warn("!! Layer 3 rate-limited/failed, calling Model 4 fallback:", err.message);
            auditorResult = await ollamaProvider.execute({ task, userInput: auditorInput, evidence: cleanEvidence });
        }

        const disagreements = [];
        if (verifierResult.issues && verifierResult.issues.length > 0) {
            disagreements.push(...verifierResult.issues);
        }
        if (auditorResult.issues && auditorResult.issues.length > 0) {
            disagreements.push(...auditorResult.issues);
        }

        let finalVerdict = AI_VERDICTS.PASS;
        if (disagreements.length > 0) {
            finalVerdict = AI_VERDICTS.PASS_WITH_FLAGS;
        }
        if (
            generatorResult.confidence < 0.6 ||
            verifierResult.confidence < 0.6 ||
            auditorResult.confidence < 0.6
        ) {
            finalVerdict = AI_VERDICTS.UNKNOWN;
        }

        const totalLatencyMs = Date.now() - startTime;

        // aiRun record
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
            auditorResult,
            disagreements,
            totalLatencyMs,
        });

        return {
            runId: aiRun._id,
            verdict: finalVerdict,
            disagreements,
            summary: generatorResult.conclusion,
            auditedClaims: generatorResult.claims,
            flags: [...(verifierResult.uncertainties || []), ...(auditorResult.uncertainties || [])],
            totalLatencyMs,
            providerChain: [
                generatorResult.provider,
                verifierResult.provider,
                auditorResult.provider,
            ],
        };
    },
};
