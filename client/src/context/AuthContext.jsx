import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient, { setAccessToken, refreshAccessToken } from "@/lib/api/client";

export const ROLE_DASHBOARD_PATHS = Object.freeze({
  STARTUP_USER: "/startup/dashboard",
  GOVERNMENT_USER: "/government/dashboard",
  EVALUATOR: "/evaluator/queue",
  ADMIN: "/admin/audit",
});

const EMPTY_SESSION = {
  user: null,
  organization: null,
  membership: null,
  profile: null,
};

const AuthContext = createContext(null);

function unwrapData(response) {
  return response?.data ?? response ?? {};
}

async function fetchOrganizationSafely(explicitToken) {
  try {
    const requestConfig = explicitToken
      ? { headers: { Authorization: `Bearer ${explicitToken}` } }
      : {};
    const response = await apiClient.get("/organizations/my/current", requestConfig);
    return unwrapData(response);
  } catch {
    return {
      organization: null,
      membership: null,
      profile: null,
    };
  }
}

async function loadSession() {
  try {
    const refreshedToken = await refreshAccessToken();

    if (!refreshedToken) {
      setAccessToken(null);
      return EMPTY_SESSION;
    }

    const meResponse = await apiClient.get("/auth/get-me");
    const meData = unwrapData(meResponse);
    const user = meData.user ?? null;

    if (!user) {
      return EMPTY_SESSION;
    }

    const orgData = await fetchOrganizationSafely();
    return {
      user,
      organization: orgData.organization ?? null,
      membership: orgData.membership ?? null,
      profile: orgData.profile ?? null,
    };
  } catch {
    setAccessToken(null);
    return EMPTY_SESSION;
  }
}

export function getRoleDashboardPath(role) {
  return ROLE_DASHBOARD_PATHS[role] || "/";
}

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: ["auth", "session"],
    queryFn: loadSession,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const session = sessionQuery.data ?? EMPTY_SESSION;

  const setSession = useCallback(
    (nextSession) => {
      queryClient.setQueryData(["auth", "session"], {
        ...EMPTY_SESSION,
        ...nextSession,
      });
    },
    [queryClient]
  );

  const refreshOrganization = useCallback(async () => {
    const orgData = await fetchOrganizationSafely();
    setSession({
      ...session,
      organization: orgData.organization ?? null,
      membership: orgData.membership ?? null,
      profile: orgData.profile ?? null,
    });
    return orgData;
  }, [session, setSession]);

  const login = useCallback(
    async (credentials) => {
      const response = await apiClient.post("/auth/login", credentials);
      const data = unwrapData(response);
      const token = data.accessToken;

      if (!token || !data.user) {
        throw new Error("Login response did not include a session token");
      }

      setAccessToken(token);
      const orgData = await fetchOrganizationSafely();
      const nextSession = {
        user: data.user,
        organization: orgData.organization ?? null,
        membership: orgData.membership ?? null,
        profile: orgData.profile ?? null,
      };

      setSession(nextSession);
      toast.success("Signed in successfully");
      return nextSession;
    },
    [setSession]
  );

  const register = useCallback(async (payload) => {
    const response = await apiClient.post("/auth/register", payload);
    const data = unwrapData(response);
    toast.success("Account created. Check your email for the OTP.");
    return data;
  }, []);

  const verifyEmail = useCallback(async (payload) => {
    const response = await apiClient.post("/auth/verify-email", payload);
    const data = unwrapData(response);
    toast.success("Email verified. You can sign in now.");
    return data;
  }, []);

  const forgotPassword = useCallback(async (payload) => {
    const response = await apiClient.post("/auth/forgot-password", payload);
    toast.success("Password reset instructions sent if the account exists.");
    return unwrapData(response);
  }, []);

  const resetPassword = useCallback(async ({ confirmPassword, ...payload }) => {
    const response = await apiClient.post("/auth/reset-password", payload);
    toast.success("Password reset complete. Sign in with the new password.");
    return unwrapData(response);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Client state must still be cleared if the refresh cookie is absent.
    } finally {
      setAccessToken(null);
      await queryClient.cancelQueries({ queryKey: ["auth", "session"] });
      queryClient.setQueryData(["auth", "session"], EMPTY_SESSION);
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] !== "auth",
      });
      toast.success("Signed out");
    }
  }, [queryClient]);

  const createOrganization = useCallback(
    async (payload) => {
      const response = await apiClient.post("/organizations", payload);
      const data = unwrapData(response);

      setSession({
        ...session,
        organization: data.organization ?? null,
        profile: data.startupProfile ?? session.profile ?? null,
        membership: session.membership ?? null,
      });

      toast.success("Organization workspace created");
      return data;
    },
    [session, setSession]
  );

  const handleOAuthToken = useCallback(
    async (token) => {
      if (!token) {
        throw new Error("OAuth callback did not include an access token");
      }

      setAccessToken(token);
      const meResponse = await apiClient.get("/auth/get-me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const meData = unwrapData(meResponse);

      if (!meData.user) {
        throw new Error("Could not load OAuth profile");
      }

      const orgData = await fetchOrganizationSafely(token);
      const nextSession = {
        user: meData.user,
        organization: orgData.organization ?? null,
        membership: orgData.membership ?? null,
        profile: orgData.profile ?? null,
      };

      setSession(nextSession);
      toast.success("Signed in with Google");
      return nextSession;
    },
    [setSession]
  );

  const value = useMemo(
    () => ({
      user: session.user,
      organization: session.organization,
      membership: session.membership,
      profile: session.profile,
      isLoading: sessionQuery.isLoading,
      isAuthenticated: Boolean(session.user),
      authError: sessionQuery.error,
      login,
      register,
      verifyEmail,
      forgotPassword,
      resetPassword,
      logout,
      createOrganization,
      refreshOrganization,
      handleOAuthToken,
    }),
    [
      createOrganization,
      forgotPassword,
      handleOAuthToken,
      login,
      logout,
      refreshOrganization,
      register,
      resetPassword,
      session.membership,
      session.organization,
      session.profile,
      session.user,
      sessionQuery.error,
      sessionQuery.isLoading,
      verifyEmail,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
