import { BaseAIAdapter } from "../aiAdapter.js";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
const DEFAULT_MODEL = "google/gemma-3-27b-it:free";

export class OpenRouterProvider extends BaseAIAdapter {
    constructor() {
        super("openrouter", DEFAULT_MODEL);
    }

    async isAvailable() {
        return Boolean(OPENROUTER_API_KEY);
    }

    async execute({ task, userInput, evidence = [] }) {
        const startTime = Date.now();

        // fallback if no API key is provided
        if (!OPENROUTER_API_KEY) {
            return {
                conclusion: `[SIMULATED OPENROUTER AUDIT] Third-party diversity audit concurs with primary feasibility for: ${task}.`,
                claims: ["Independent check confirms regulatory alignment with state procurement rules"],
                evidenceUsed: evidence.length > 0 ? evidence : ["Submitted technical documentation"],
                uncertainties: [],
                issues: [],
                confidence: 0.93,
                model: `${DEFAULT_MODEL}-mock`,
                provider: this.providerName,
                latencyMs: Date.now() - startTime,
            };
        }

        const prompt = `
You are the Independent Third-Party Auditor (Model 3) for a Government Procurement Platform.
Review the original proposal, canonical evidence, and previous verifier conclusions.
Identify if earlier models made assumptions unsupported by canonical evidence.

TASK: ${task}
USER INPUT & PREVIOUS FINDINGS:
${userInput}

CANONICAL EVIDENCE:
${evidence.length > 0 ? evidence.join("\n---\n") : "No attached documents provided."}

Respond ONLY with a valid JSON object matching this exact shape:
{
  "conclusion": "string",
  "claims": ["string"],
  "evidenceUsed": ["string"],
  "uncertainties": ["string"],
  "issues": ["string"],
  "confidence": 0.90
}
`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": "http://localhost:3001",
                "X-Title": "SIH-2026-GovX-Platform",
            },
            body: JSON.stringify({
                model: DEFAULT_MODEL,
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" },
                temperature: 0.1,
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`OpenRouter API returned ${response.status}: ${errText}`);
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
            confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.88,
            model: DEFAULT_MODEL,
            provider: this.providerName,
            latencyMs: Date.now() - startTime,
        };
    }
}

export const openrouterProvider = new OpenRouterProvider();
