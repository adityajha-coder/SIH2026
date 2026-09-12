import Problem from "../../models/problem.model.js";

const OGD_API_BASE = process.env.OGD_API_BASE || "https://api.data.gov.in/resource";
const OGD_API_KEY = process.env.OGD_API_KEY || "";

// Popular public procurement & innovation resource IDs on data.gov.in
export const OGD_DEFAULT_RESOURCES = {
    PUBLIC_TENDERS: "9ef84268-d588-465a-a308-a864a43d0070",
    AGRI_PROJECTS: "6da18371-d687-483a-b851-f76dbdd0335e",
};

export const ogdService = {
    async fetchLiveRecords({ resourceId = OGD_DEFAULT_RESOURCES.PUBLIC_TENDERS, limit = 10, offset = 0 }) {
        if (!OGD_API_KEY) {
            console.warn("⚠️ OGD_API_KEY not set in .env. Using sandbox data.");
            return null;
        }

        const url = `${OGD_API_BASE}/${resourceId}?api-key=${OGD_API_KEY}&format=json&limit=${limit}&offset=${offset}`;

        try {
            const res = await fetch(url, {
                headers: {
                    "Accept": "application/json",
                    "User-Agent": "SIH-2026-GovX-Platform/1.0",
                },
                signal: AbortSignal.timeout(8000), // 8s timeout
            });

            if (!res.ok) {
                throw new Error(`OGD API responded with status ${res.status}: ${res.statusText}`);
            }

            const json = await res.json();
            return {
                totalRecords: json.total || 0,
                records: json.records || [],
                title: json.title || "Government Open Dataset",
            };
        } catch (error) {
            console.error("❌ Failed to fetch from data.gov.in:", error.message);
            return null;
        }
    },

    async fetchAndIngestLiveChallenges({ resourceId, limit = 5, createdById, organizationId }) {
        const liveData = await this.fetchLiveRecords({ resourceId, limit });

        if (liveData && Array.isArray(liveData.records) && liveData.records.length > 0) {
            const ingested = [];

            for (const item of liveData.records) {
                const title = item.title || item.tender_title || item.scheme_name || item.project_name || `Public Challenge: ${item._id || Date.now()}`;
                const description = item.description || item.scope_of_work || item.tender_description || "Public sector requirement sourced via data.gov.in";
                const sector = item.sector || item.department || item.ministry || "Public Administration";
                const state = item.state || item.state_name || "All India";

                const doc = await Problem.findOneAndUpdate(
                    { title },
                    {
                        $setOnInsert: {
                            title,
                            shortSummary: description.substring(0, 180) + "...",
                            fullStatement: description,
                            sectors: [sector],
                            procurementPath: "COMPETITIVE_BID",
                            mandatoryRequirements: [
                                "Valid DPIIT startup certificate or recognized MSME registration",
                                "Compliance with GFR 2017 Rule 144 / Make in India guidelines",
                            ],
                            geography: { state, districts: [] },
                            createdById,
                            organizationId,
                            status: "PUBLISHED",
                            publishedAt: new Date(),
                            applicationOpenAt: new Date(),
                            applicationCloseAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
                        },
                    },
                    { upsert: true, new: true }
                );

                ingested.push(doc);
            }

            return { source: "DATA_GOV_IN_LIVE", count: ingested.length, problems: ingested };
        }

        return this.seedFallbackChallenges({ createdById, organizationId });
    },

    async seedFallbackChallenges({ createdById, organizationId }) {
        const FALLBACKS = [
            {
                title: "Autonomous Drone Spraying for Locust & Pest Mitigation",
                shortSummary: "Automated drone deployment with ultra-low volume nozzles for pest mitigation in arid belts.",
                fullStatement: "The Department of Agriculture requires an automated drone deployment mechanism capable of operating under low-wind conditions with ultra-low volume (ULV) nozzles without contaminating local water reservoirs.",
                sectors: ["Agriculture", "Drones", "Robotics"],
                procurementPath: "DIRECT_PILOT",
                mandatoryRequirements: [
                    "Valid DGCA Type Certificate for agricultural drone",
                    "Ultra-low volume (ULV) droplet dispensation capability",
                ],
                geography: { state: "Rajasthan", districts: ["Jaisalmer", "Bikaner"] },
            },
            {
                title: "Real-time Biochemical Sensor for Rural Water Quality Monitoring",
                shortSummary: "IoT-enabled low-power sensor network for continuous detection of arsenic, fluoride, and bacterial contamination.",
                fullStatement: "Under Jal Jeevan Mission, rural tap water requires telemetry-based real-time potable water assurance. Systems must withstand extreme weather conditions and transmit via LoRaWAN/NB-IoT.",
                sectors: ["Water", "IoT", "CleanTech"],
                procurementPath: "COMPETITIVE_BID",
                mandatoryRequirements: [
                    "Electrochemical or optical sensing for arsenic (<10 ppb detection limit)",
                    "Low-power operation on solar/battery for >12 months",
                ],
                geography: { state: "Bihar", districts: ["Patna", "Vaishali"] },
            },
        ];

        const seeded = [];
        for (const item of FALLBACKS) {
            const doc = await Problem.findOneAndUpdate(
                { title: item.title },
                {
                    $setOnInsert: {
                        ...item,
                        createdById,
                        organizationId,
                        status: "PUBLISHED",
                        publishedAt: new Date(),
                        applicationOpenAt: new Date(),
                        applicationCloseAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                    },
                },
                { upsert: true, new: true }
            );
            seeded.push(doc);
        }
        return { source: "SANDBOX_CATALOG", count: seeded.length, problems: seeded };
    },
};
