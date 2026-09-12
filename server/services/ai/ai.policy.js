// free tier models
export const APPROVED_PROVIDERS = Object.freeze({
    GOOGLE: "google",
    GROQ: "groq",
    OPENROUTER: "openrouter",
    OLLAMA: "ollama",
});

export const APPROVED_MODELS = Object.freeze([
     "gemini-3.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-2.5-flash-mock",
    "openai/gpt-oss-20b",
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "liquid/lfm-2.5-2.6b:free",
    "google/gemma-3-27b-it:free",
    "gemma3:latest",
    "qwen2.5:3b",
    "qwen:latest",
]);

export const AI_LIMITS = Object.freeze({
    MAX_PROMPT_CHARS: 30000,
    MAX_OUTPUT_TOKENS: 4096,
    TIMEOUT_MS: 15000,
});

export const aiPolicy = {
   
    validateCall({ provider, model }) {
        if (!Object.values(APPROVED_PROVIDERS).includes(provider)) {
            const err = new Error(`Provider '${provider}' is not permitted under the Zero-Cost Hackathon Policy`);
            err.statusCode = 403;
            err.code = "AI_PROVIDER_DISALLOWED";
            throw err;
        }

        if (!APPROVED_MODELS.includes(model)) {
            const err = new Error(`Model '${model}' is not on the approved zero-price allowlist`);
            err.statusCode = 403;
            err.code = "AI_MODEL_DISALLOWED";
            throw err;
        }

        return true;
    },

    
    sanitizeInput(text = "") {
        if (typeof text !== "string") return "";
        let sanitized = text;

        if (sanitized.length > AI_LIMITS.MAX_PROMPT_CHARS) {
            sanitized = sanitized.slice(0, AI_LIMITS.MAX_PROMPT_CHARS) + "\n...[truncated for length]";
        }

        // redact jwt
        sanitized = sanitized.replace(/bearer\s+[a-zA-Z0-9_\-\.]+/gi, "bearer [REDACTED]");
        sanitized = sanitized.replace(/eyJ[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+/g, "[REDACTED_JWT]");

        return sanitized;
    },
};
