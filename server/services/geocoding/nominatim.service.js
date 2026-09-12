const NOMINATIM_BASE_URL = process.env.NOMINATIM_BASE_URL || "https://nominatim.openstreetmap.org";
let lastRequestTime = 0;

export const nominatimService = {
    // Geocode state and district with 1 req/sec rate limit and OSM compliance
     
    async geocodeLocation({ district = "", state = "", country = "India" }) {
        const query = [district, state, country].filter(Boolean).join(", ");
        if (!query.trim()) return null;

        // 1 req/s
        const now = Date.now();
        const timeSinceLast = now - lastRequestTime;
        if (timeSinceLast < 1000) {
            await new Promise((resolve) => setTimeout(resolve, 1000 - timeSinceLast));
        }
        lastRequestTime = Date.now();

        try {
            const url = `${NOMINATIM_BASE_URL}/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=1`;
            const response = await fetch(url, {
                headers: {
                    "User-Agent": "SIH-2026-GovX-Platform/1.0 (procurement-support@sih2026.gov.in)",
                    Referer: "http://localhost:3001",
                },
                signal: AbortSignal.timeout(5000),
            });

            if (!response.ok) return null;
            const data = await response.json();
            if (!data || data.length === 0) return null;

            const top = data[0];
            return {
                displayName: top.display_name,
                lat: parseFloat(top.lat),
                lon: parseFloat(top.lon),
                state: top.address?.state || state,
                district: top.address?.state_district || top.address?.county || district,
                country: top.address?.country || "India",
            };
        } catch (error) {
            console.warn("!! Nominatim geocoding notice:", error.message);
            return {
                displayName: query,
                lat: null,
                lon: null,
                state,
                district,
                country,
            };
        }
    },
};
