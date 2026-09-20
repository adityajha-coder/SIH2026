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

export function useProblemTemplates(problemId) {
  return useQuery({
    queryKey: ["evaluations", "templates", "problem", problemId],
    queryFn: async () => {
      if (!problemId) return [];
      const res = await apiClient.get(`/evaluations/templates/problem/${problemId}`);
      return res?.data || [];
    },
    enabled: Boolean(problemId),
    staleTime: 1000 * 60,
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ problemId, title, criteria }) => {
      const res = await apiClient.post("/evaluations/templates", {
        problemId,
        title,
        criteria,
      });
      return res?.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["evaluations", "templates", "problem", variables.problemId],
      });
    },
  });
}

export function useEvaluatorList() {
  return useQuery({
    queryKey: ["evaluations", "evaluators"],
    queryFn: async () => {
      const res = await apiClient.get("/evaluations/evaluators");
      return res?.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useAssignEvaluator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ submissionId, evaluatorId, templateId, deadline }) => {
      const res = await apiClient.post("/evaluations/assignments", {
        submissionId,
        evaluatorId,
        templateId,
        deadline,
      });
      return res?.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["evaluations", "assignments", "submission", variables.submissionId],
      });
      queryClient.invalidateQueries({ queryKey: ["department", "submissions"] });
    },
  });
}

export function useSubmissionAssignments(submissionId) {
  return useQuery({
    queryKey: ["evaluations", "assignments", "submission", submissionId],
    queryFn: async () => {
      if (!submissionId) return [];
      const res = await apiClient.get(`/evaluations/assignments/submission/${submissionId}`);
      return res?.data || [];
    },
    enabled: Boolean(submissionId),
    staleTime: 1000 * 30,
  });
}

export function useDecision(submissionId) {
  return useQuery({
    queryKey: ["evaluations", "decision", submissionId],
    queryFn: async () => {
      if (!submissionId) return null;
      try {
        const res = await apiClient.get(`/evaluations/decisions/submission/${submissionId}`);
        return res?.data || null;
      } catch {
        return null;
      }
    },
    enabled: Boolean(submissionId),
    staleTime: 1000 * 60,
  });
}

export function useCreateDecision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const res = await apiClient.post("/evaluations/decisions", payload);
      return res?.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["evaluations", "decision", variables?.submissionId],
      });
      queryClient.invalidateQueries({ queryKey: ["department", "submissions"] });
      queryClient.invalidateQueries({ queryKey: ["submission", variables?.submissionId] });
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
    },
  });
}
