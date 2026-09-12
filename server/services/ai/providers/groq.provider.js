import { BaseAIAdapter } from "../aiAdapter.js";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

export class GroqProvider extends BaseAIAdapter {
    constructor() {
        super("groq", DEFAULT_MODEL);
    }

    async isAvailable() {
        return Boolean(GROQ_API_KEY);
    }

    async execute({ task, userInput, evidence = [] }) {
        const startTime = Date.now();

        // fallback if no API key is set
        if (!GROQ_API_KEY) {
            return {
                conclusion: `[SIMULATED GROQ VERIFICATION] Independent audit confirms core feasibility for task: ${task}.`,
                claims: ["Proposed delivery schedule aligns with rural operational constraints"],
                evidenceUsed: evidence.length > 0 ? evidence : ["Prior pilot records"],
                uncertainties: ["Requires DGCA drone corridor clearance"],
                issues: [],
                confidence: 0.91,
                model: `${DEFAULT_MODEL}-mock`,
                provider: this.providerName,
                latencyMs: Date.now() - startTime,
            };
        }

        const prompt = `
You are the Independent Verifier Model (Model 2) for a Government Procurement & Startup Platform.
Your job is to independently inspect the task, user input, and canonical evidence.
Highlight any unsupported claims, safety risks, or regulatory blockers.

TASK: ${task}
USER INPUT: ${userInput}
CANONICAL EVIDENCE:
${evidence.length > 0 ? evidence.join("\n---\n") : "No attached documents provided."}

Respond ONLY with a valid JSON object matching this exact shape:
{
  "conclusion": "string",
  "claims": ["string"],
  "evidenceUsed": ["string"],
  "uncertainties": ["string"],
  "issues": ["string"],
  "confidence": 0.85
}
`;

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: DEFAULT_MODEL,
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" },
                temperature: 0.2,
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Groq API returned ${response.status}: ${errText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || "{}";
        const parsed = JSON.parse(content.trim());

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

export const groqProvider = new GroqProvider();
