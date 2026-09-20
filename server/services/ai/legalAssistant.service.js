
export const DEFAULT_MODELS = [
    process.env.OPENROUTER_CHAT_MODEL,
    "nex-agi/nex-n2.5-pro:free",
    "nex-agi/nex-n2.5-mini:free",
].filter(Boolean);

// Curated official government reference links directory
export const OFFICIAL_GOVERNMENT_LINKS = [
    {
        keywords: ["dpiit", "startup india", "recognition", "80-iac", "angel tax", "seed fund"],
        title: "Startup India Hub (DPIIT Official Portal)",
        url: "https://www.startupindia.gov.in",
        description: "Official Government of India portal for DPIIT startup recognition, tax exemptions, and Seed Fund Scheme.",
    },
    {
        keywords: ["dpiit", "ministry of commerce", "internal trade"],
        title: "DPIIT Central Portal (Ministry of Commerce & Industry)",
        url: "https://dpiit.gov.in",
        description: "Official notifications, Gazette G.S.R. 127(E), and startup policy directives.",
    },
    {
        keywords: ["gfr", "rule 173", "rule 170", "emd", "procurement rules", "tender", "expenditure"],
        title: "Department of Expenditure (Public Procurement Division)",
        url: "https://doe.gov.in",
        description: "Official General Financial Rules (GFR 2017) and statutory procurement waiver guidelines.",
    },
    {
        keywords: ["gem", "government e-marketplace", "marketplace", "catalogue", "direct purchase"],
        title: "Government e-Marketplace (GeM Portal)",
        url: "https://gem.gov.in",
        description: "GeM Startup Runway and national public procurement portal for direct scale-up orders.",
    },
    {
        keywords: ["msme", "msmed", "section 15", "payment delay", "delayed payment", "samadhaan", "30 days", "45 days"],
        title: "MSME Samadhaan (Delayed Payment Monitoring)",
        url: "https://samadhaan.msme.gov.in",
        description: "Statutory payment dispute portal enforcing Section 15 and Section 16 of the MSMED Act 2006.",
    },
    {
        keywords: ["patent", "ipr", "sipp", "trademark", "intellectual property"],
        title: "Controller General of Patents, Designs & Trademarks (IP India)",
        url: "https://ipindia.gov.in",
        description: "SIPP scheme offering 80% rebate on patent filing fees for DPIIT startups.",
    },
    {
        keywords: ["maharashtra", "msins", "state policy", "sandbox", "gr"],
        title: "Maharashtra State Innovation Society (MSInS)",
        url: "https://msins.in",
        description: "State innovation society offering direct sandbox pilot work orders up to ₹25-₹50 Lakhs.",
    },
];

// Pragati-GovX actionable platform shortcuts
export const PLATFORM_SHORTCUTS = [
    {
        keywords: ["passport", "profile", "dpiit number", "update dpiit", "recognition number", "exemption"],
        title: "Startup Passport",
        route: "/startup/profile",
        description: "Add or update your verified DPIIT recognition number to unlock 100% GFR 173(i) waivers across all challenges.",
    },
    {
        keywords: ["challenge", "problem", "apply", "tender", "rfp", "bid"],
        title: "Explore Civic Challenges",
        route: "/challenges",
        description: "Browse open government challenges, district GIS maps, and grant allocations.",
    },
    {
        keywords: ["pilot", "sandbox", "milestone", "telemetry", "canvas", "sla", "payment"],
        title: "Active Pilot Canvas",
        route: "/pilots",
        description: "Track 90-day sandbox pilots, upload sensor telemetry, and monitor 30-day payment countdown SLAs.",
    },
    {
        keywords: ["submission", "proposals", "my applications", "status"],
        title: "My Submissions & Applications",
        route: "/startup/submissions",
        description: "View proposal evaluation status, evaluator clarification queries, and sanction letters.",
    },
];

export function sanitizePlainText(text = "") {
    if (!text || typeof text !== "string") return "";

    let cleaned = text;

    // Replace Markdown headers like '### Header' with 'Header:' (or keep existing punctuation if ending with ? or :)
    cleaned = cleaned.replace(/^#{1,6}\s*(.*)$/gm, (match, headerText) => {
        const trimmed = headerText.trim();
        if (/[?!:]$/.test(trimmed)) {
            return trimmed;
        }
        return `${trimmed}:`;
    });

    cleaned = cleaned.replace(/\*{1,3}(.*?)\*{1,3}/g, "$1");

    cleaned = cleaned.replace(/[#*]/g, "");

    // Normalize spacing and clean up double colons
    cleaned = cleaned.replace(/:{2,}/g, ":");
    cleaned = cleaned.trim();

    return cleaned;
}

export function matchOfficialLinks(query = "", responseText = "") {
    const combined = `${query} ${responseText}`.toLowerCase();
    const matched = [];

    for (const link of OFFICIAL_GOVERNMENT_LINKS) {
        const matches = link.keywords.some((kw) => combined.includes(kw));
        if (matches) {
            matched.push({
                title: link.title,
                url: link.url,
                description: link.description,
            });
        }
    }

    if (matched.length === 0) {
        matched.push(OFFICIAL_GOVERNMENT_LINKS[0]);
    }

    return matched.slice(0, 3);
}

export function matchPlatformActions(query = "", responseText = "") {
    const combined = `${query} ${responseText}`.toLowerCase();
    const actions = [];

    for (const action of PLATFORM_SHORTCUTS) {
        const matches = action.keywords.some((kw) => combined.includes(kw));
        if (matches) {
            actions.push({
                title: action.title,
                route: action.route,
                description: action.description,
            });
        }
    }

    // Always include Startup Passport or Challenges if empty
    if (actions.length === 0) {
        actions.push(PLATFORM_SHORTCUTS[0]);
        actions.push(PLATFORM_SHORTCUTS[1]);
    }

    return actions.slice(0, 2);
}

function generateSimulatedResponse(query = "", startupUser = null) {
    const q = query.toLowerCase();
    const startupName = startupUser?.name || "Founder";

    if (q.includes("dpiit") || q.includes("recognition")) {
        return `Namaste ${startupName}. I am Startup Mitra, your Pragati-GovX Legal and Public Procurement guide.

DPIIT stands for the Department for Promotion of Industry and Internal Trade, operating under the Ministry of Commerce and Industry, Government of India.

What is DPIIT Recognition:
It is an official certification granted to eligible entities (Private Limited Company, LLP, or Registered Partnership) that confers statutory startup status for up to 10 years from incorporation, provided annual turnover has not exceeded 100 Crore INR.

Key Statutory Benefits for Startups:
1. 100% Exemption from Earnest Money Deposit (EMD) and tender fees under GFR 2017 Rule 170.
2. Complete waiver from prior turnover and prior operating experience criteria under GFR 2017 Rule 173(i).
3. Eligibility for 3-year consecutive income tax exemption under Section 80-IAC of the Income Tax Act.
4. 80% discount on patent filing fees and 50% discount on trademark fees through the SIPP scheme.
5. Direct access to the GeM Startup Runway for public procurement without competitive tender barriers.

How to Leverage This on Pragati-GovX:
Navigate to your Startup Passport at /startup/profile. Enter your official DPIIT Recognition Number (for example, DIPP12345). Once verified, Pragati-GovX automatically injects statutory GFR 173(i) exemption badges into every challenge proposal you submit, completely waiving prior balance sheet and EMD requirements.`;
    }

    if (q.includes("gfr") || q.includes("173") || q.includes("turnover") || q.includes("experience")) {
        return `Namaste ${startupName}. I am Startup Mitra.

GFR Rule 173(i) is a landmark public procurement directive issued under the General Financial Rules (GFR 2017) by the Ministry of Finance, Government of India.

Understanding GFR Rule 173(i):
In traditional government tenders, procuring bodies demand 3 to 5 years of operating history and 5 Crore to 50 Crore INR in audited balance-sheet turnover. GFR Rule 173(i) legally empowers government departments to completely waive prior turnover and prior experience criteria for verified DPIIT startups, as long as your technical solution satisfies functional and quality standards.

How Pragati-GovX Implements This:
When you apply for civic challenges on Pragati-GovX via /challenges, our automated eligibility engine verifies your DPIIT status and bypasses all legacy turnover barriers. You are evaluated strictly on engineering merit, architecture, and field-trial capability through our double-blind review process.`;
    }

    if (q.includes("emd") || q.includes("earnest") || q.includes("security") || q.includes("fee")) {
        return `Namaste ${startupName}. I am Startup Mitra.

Under GFR 2017 Rule 170(i) and Ministry of Finance guidelines, all DPIIT-recognized startups are 100% exempt from submitting Earnest Money Deposit (EMD) or Bid Security in public tenders.

Why This Matters:
Traditional tenders require startups to deposit 2% to 5% of the total tender value as a fixed bank deposit just to participate. With DPIIT recognition, you submit proposals at zero upfront financial burden.

How Pragati-GovX Implements This:
On Pragati-GovX, all challenge applications are 100% free of EMD and tender fees for startups. You can submit your proposals directly through the 5-Step Application Wizard at /challenges without any financial deposit.`;
    }

    if (q.includes("gem") || q.includes("scale") || q.includes("marketplace")) {
        return `Namaste ${startupName}. I am Startup Mitra.

GeM (Government e-Marketplace) is the national public procurement portal in India.

GeM Startup Runway and Pragati-GovX Scale Gate:
Once your 90-day sovereign sandbox pilot is successfully completed on Pragati-GovX, our platform generates a cryptographically sealed Scale Gate Sanction Order. This statutory order permits your startup to list your validated product directly on the GeM portal special innovation window without competing in open general tenders.`;
    }

    if (q.includes("msmed") || q.includes("payment") || q.includes("sla") || q.includes("delay")) {
        return `Namaste ${startupName}. I am Startup Mitra.

The MSMED Act 2006 (Micro, Small and Medium Enterprises Development Act) protects Indian innovators against delayed payments from public buyers.

Key Legal Provisions:
Section 15 mandates that public buyers must clear milestone payments within the agreed timeline, not exceeding 45 days.
Section 16 stipulates that any delayed payment carries compound interest with monthly rests at 3 times the RBI Bank Rate.

How Pragati-GovX Implements This:
In the Pilot Canvas at /pilots, every approved milestone activates an automated statutory 30-day payment countdown timer. If a department nodal officer fails to disburse the tranche within 30 days, automated escalation notices are sent to the Directorate of Industries and MSInS leadership.`;
    }

    return `Namaste ${startupName}. Welcome! I am Startup Mitra, your dedicated Legal and Public Procurement AI guide on Pragati-GovX.

I can assist you with:
1. DPIIT Startup Recognition and statutory eligibility benefits.
2. General Financial Rules (GFR 2017) Rule 173(i) turnover waivers and Rule 170 EMD exemptions.
3. MSMED Act 2006 Section 15 statutory 30-day payment SLAs.
4. Intellectual property rebates (80% fee discount under the SIPP scheme).
5. Step-by-step guidance on applying for civic challenges and tracking 90-day sandbox pilots on Pragati-GovX.

How to Get Started on Pragati-GovX:
First, update your Startup Passport at /startup/profile with your DPIIT recognition number.
Second, explore open civic challenges across Maharashtra districts at /challenges.
Third, apply via our 5-Step Wizard with memory-safe direct S3 evidence uploads.`;
}

export class LegalAssistantService {
    constructor() {
        this.apiKey = process.env.OPENROUTER_API_KEY || "";
    }

    getApiKey() {
        return process.env.OPENROUTER_API_KEY || this.apiKey || "";
    }

    getModels() {
        return [
            process.env.OPENROUTER_CHAT_MODEL,
            "nex-agi/nex-n2.5-pro:free",
            "nex-agi/nex-n2.5-mini:free",
        ].filter(Boolean);
    }

    /**
     * Executes query against OpenRouter API with prompt engineering grounded in
     * Indian law, procurement rules, and Pragati-GovX platform features.
     */
    async queryAssistant({ query, conversationHistory = [], startupUser = null }) {
        const startTime = Date.now();
        const userQuery = (query || "").trim();
        const startupName = startupUser?.name || "Startup Founder";
        const orgName = startupUser?.organizationName || "Your Venture";
        const currentApiKey = this.getApiKey();

        // System prompt training the AI to provide grounded, link-referenced, clean answers
        const systemPrompt = `
You are Startup Mitra, the Official Legal & Public Procurement AI Concierge of Pragati-GovX (Sovereign Innovation Sandbox & Agile Public Procurement Gateway for the Government of Maharashtra and Government of India).
You are speaking directly with an authenticated startup founder: ${startupName} representing "${orgName}". Always introduce yourself warmly as Startup Mitra when starting a conversation.

YOUR MISSION:
1. Explain Indian public procurement laws, DPIIT startup recognitions, and statutory rights clearly and professionally.
2. Demystify complex legal frameworks (GFR 2017 Rules 170 and 173(i), MSMED Act 2006 Sections 15 & 16, GeM Startup Runway, SIPP Patent Scheme, Maharashtra Startup Policy 2024).
3. Guide the startup on EXACTLY how to utilize the Pragati-GovX platform features:
   - Startup Passport (/startup/profile): Adding DPIIT number to unlock 100% GFR 173(i) turnover & EMD waivers.
   - Civic Challenges Explorer (/challenges): Finding published municipal/departmental problem statements.
   - 5-Step Application Wizard (/challenges/:id/apply): Submitting proposals with memory-safe client-side SHA-256 S3 evidence streaming.
   - Pilot Canvas (/pilots): Managing 90-day field sandboxes, 30%-40%-30% tranches, live telemetry, and the statutory 30-day payment SLA under MSMED Act.
   - Scale Gate: Direct onboarding to the Government e-Marketplace (GeM) upon pilot completion.
4. Mention official government links and portals as authority references (Startup India, DPIIT, GeM, Department of Expenditure, MSME Samadhaan, IP India).

CRITICAL FORMATTING RULES (STRICT COMPLIANCE MANDATORY):
- NEVER use the hash symbol (#, ##, ###) anywhere in your response.
- NEVER use asterisks (*, **, ***) for bold, italic, or bullet points anywhere in your response.
- Use clean line breaks, capitalized headings with colons (e.g. WHAT IS DPIIT:), and numbered lists (1., 2.) or dash bullets (-).
- Keep language direct, empowering, authoritative, and easy to understand for early-stage founders.
`;

        // If no API key is configured, provide the simulated response
        if (!currentApiKey) {
            const rawSimulated = generateSimulatedResponse(userQuery, startupUser);
            const cleanText = sanitizePlainText(rawSimulated);
            return {
                answer: cleanText,
                officialLinks: matchOfficialLinks(userQuery, cleanText),
                platformActions: matchPlatformActions(userQuery, cleanText),
                model: "simulated-legal-advisor",
                latencyMs: Date.now() - startTime,
            };
        }

        // Build messages array
        const messages = [
            { role: "system", content: systemPrompt },
            ...conversationHistory.slice(-4).map((h) => ({
                role: h.role === "assistant" ? "assistant" : "user",
                content: h.content,
            })),
            { role: "user", content: userQuery },
        ];

        let responseContent = null;
        let usedModel = "unknown";
        const modelsToTry = this.getModels();

        // Try primary and fallback models from OpenRouter
        for (const modelName of modelsToTry) {
            try {
                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${currentApiKey}`,
                        "HTTP-Referer": "https://pragati-govx.vercel.app",
                        "X-Title": "Pragati-GovX Startup Legal Concierge",
                    },
                    body: JSON.stringify({
                        model: modelName,
                        messages,
                        temperature: 0.2,
                        max_tokens: 800,
                    }),
                    signal: AbortSignal.timeout(8000),
                });

                if (response.ok) {
                    const data = await response.json();
                    const text = data.choices?.[0]?.message?.content;
                    if (text && text.trim().length > 0) {
                        responseContent = text;
                        usedModel = modelName;
                        break;
                    }
                } else {
                    console.warn(`[OpenRouter Legal Assistant] Model ${modelName} returned status ${response.status}`);
                }
            } catch (err) {
                console.warn(`[OpenRouter Legal Assistant] Error querying model ${modelName}:`, err.message);
            }
        }

        if (!responseContent) {
            responseContent = generateSimulatedResponse(userQuery, startupUser);
            usedModel = "fallback-expert-system";
        }

        const cleanAnswer = sanitizePlainText(responseContent);

        return {
            answer: cleanAnswer,
            officialLinks: matchOfficialLinks(userQuery, cleanAnswer),
            platformActions: matchPlatformActions(userQuery, cleanAnswer),
            model: usedModel,
            latencyMs: Date.now() - startTime,
        };
    }
}

export const legalAssistantService = new LegalAssistantService();
