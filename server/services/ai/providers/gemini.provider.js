import { GoogleGenAI, Type } from "@google/genai";
import { BaseAIAdapter } from "../aiAdapter.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const DEFAULT_MODEL = "gemini-3.5-flash-lite";

let aiClient = null;
if (GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
}

export class GeminiProvider extends BaseAIAdapter {
    constructor() {
        super("google", DEFAULT_MODEL);
    }

    async isAvailable() {
        return Boolean(GEMINI_API_KEY);
    }

    async execute({ task, userInput, evidence = [] }) {
        const startTime = Date.now();

        //  fallback if no API key is provided
        if (!aiClient) {
            return {
                conclusion: `[SIMULATED GEMINI ADVISORY] Evaluated task: ${task}. Solution demonstrates technical alignment based on provided data.`,
                claims: ["Startup demonstrates relevant capability in the target domain"],
                evidenceUsed: evidence.length > 0 ? evidence : ["Self-declared profile metadata"],
                uncertainties: ["Third-party validation pending on submitted evidence"],
                issues: [],
                confidence: 0.88,
                model: `${DEFAULT_MODEL}-mock`,
                provider: this.providerName,
                latencyMs: Date.now() - startTime,
            };
        }

        const prompt = `
You are the Primary Advisory Model (Model 1) for a Government Procurement & Startup Matching Platform.
TASK: ${task}
USER INPUT: ${userInput}
CANONICAL EVIDENCE:
${evidence.length > 0 ? evidence.join("\n---\n") : "No attached documents provided."}

Return a structured advisory report evaluating how well this solution/startup addresses the challenge.
Adhere strictly to evidence. Do not extrapolate unsupported legal or financial guarantees.
`;

        const response = await aiClient.models.generateContent({
            model: DEFAULT_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        conclusion: { type: Type.STRING },
                        claims: { type: Type.ARRAY, items: { type: Type.STRING } },
                        evidenceUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
                        uncertainties: { type: Type.ARRAY, items: { type: Type.STRING } },
                        issues: { type: Type.ARRAY, items: { type: Type.STRING } },
                        confidence: { type: Type.NUMBER },
                    },
                    required: ["conclusion", "claims", "evidenceUsed", "uncertainties", "issues", "confidence"],
                },
            },
        });

        const parsed = JSON.parse(response.text.trim());

        return {
            conclusion: parsed.conclusion || "",
            claims: parsed.claims || [],
            evidenceUsed: parsed.evidenceUsed || [],
            uncertainties: parsed.uncertainties || [],
            issues: parsed.issues || [],
            confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.85,
            model: DEFAULT_MODEL,
            provider: this.providerName,
            latencyMs: Date.now() - startTime,
        };
    }
}

export const geminiProvider = new GeminiProvider();
