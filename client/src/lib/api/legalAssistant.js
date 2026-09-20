import apiClient from "./client";

/**
 * Ask the Startup Legal & Compliance Assistant
 * @param {Object} params
 * @param {string} params.query - User prompt (e.g. "what is DPIIT")
 * @param {Array} [params.conversationHistory] - Prior messages in current session
 * @returns {Promise<{ answer: string, officialLinks: Array, platformActions: Array, model: string, latencyMs: number }>}
 */
export async function askLegalAssistant({ query, conversationHistory = [] }) {
  const response = await apiClient.post(
    "/ai/legal-chat",
    {
      query,
      conversationHistory,
    },
    {
      timeout: 15000,
    }
  );
  // apiClient response interceptor already returns response.data
  // The backend sends: { data: { answer, officialLinks, platformActions, model, latencyMs }, meta, error }
  if (response?.data?.answer) {
    return response.data;
  }
  if (response?.answer) {
    return response;
  }
  if (response?.data) {
    return response.data;
  }
  return response || {};
}
