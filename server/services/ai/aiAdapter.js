
 // Base AI Adapter Interface
 // All model providers (Gemini, Groq, OpenRouter, Ollama)
export class BaseAIAdapter {
    constructor(providerName, defaultModel) {
        this.providerName = providerName;
        this.defaultModel = defaultModel;
    }

    
    async execute({ task, userInput, evidence = [] }) {
        throw new Error(`execute() not implemented in provider: ${this.providerName}`);
    }

    async isAvailable() {
        return true;
    }
}
