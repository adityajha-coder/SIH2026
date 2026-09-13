import axios from "axios";

// In-memory access token storage
let currentAccessToken = null;

export function setAccessToken(token) {
  currentAccessToken = token;
}

export function getAccessToken() {
  return currentAccessToken;
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/v1",
  withCredentials: true, // Necessary for HTTP-only cookies
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    if (currentAccessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${currentAccessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    const isAuthEndpoint = originalRequest.url?.includes("/auth/");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt refresh via HTTP-only cookie
        const refreshRes = await axios.get("/v1/auth/refresh-token", {
          withCredentials: true,
        });

        const newAccessToken = refreshRes.data?.accessToken;
        if (newAccessToken) {
          setAccessToken(newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        setAccessToken(null);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    const customError = {
      status: error.response?.status || 500,
      code: error.response?.data?.error?.code || "NETWORK_ERROR",
      message:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred",
      details: error.response?.data?.error?.details || null,
      traceId: error.response?.data?.meta?.traceId || null,
    };

    return Promise.reject(customError);
  }
);

export default apiClient;
