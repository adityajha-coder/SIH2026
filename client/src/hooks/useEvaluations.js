import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";

export function useMyAssignments() {
  return useQuery({
    queryKey: ["evaluations", "assignments", "me"],
    queryFn: async () => {
      const res = await apiClient.get("/evaluations/assignments/me");
      return res?.data || [];
    },
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useSubmitScores() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ assignmentId, scores, overallComment }) => {
      const res = await apiClient.post(
        `/evaluations/assignments/${assignmentId}/scores`,
        { scores, overallComment }
      );
      return res?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluations", "assignments"] });
    },
  });
}

export function useSubmissionResponses(submissionId) {
  return useQuery({
    queryKey: ["evaluations", "responses", submissionId],
    queryFn: async () => {
      if (!submissionId) return [];
      const res = await apiClient.get(
        `/evaluations/responses/submission/${submissionId}`
      );
      return res?.data || [];
    },
    enabled: Boolean(submissionId),
    staleTime: 1000 * 60,
  });
}

export function useAiVerify() {
  return useMutation({
    mutationFn: async ({ task, userInput, evidence, entityType, entityId }) => {
      const res = await apiClient.post("/ai/verify", {
        task,
        userInput,
        evidence: evidence || [],
        entityType,
        entityId,
      });
      return res?.data;
    },
  });
}
