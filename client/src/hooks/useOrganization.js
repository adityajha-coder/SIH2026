import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { toast } from "sonner";

export function useCurrentOrganization() {
  return useQuery({
    queryKey: ["organization", "current"],
    queryFn: async () => {
      try {
        const response = await apiClient.get("/organizations/my/current");
        return response?.data || null;
      } catch (err) {
        if (err?.response?.status === 404) return null;
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateStartupProfile(organizationId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileData) => {
      const response = await apiClient.put(
        `/organizations/${organizationId}/profile`,
        profileData
      );
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization", "current"] });
      queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
      toast.success("Startup Passport updated successfully!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update Startup Passport");
    },
  });
}
