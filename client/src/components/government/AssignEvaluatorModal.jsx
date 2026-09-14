import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  useEvaluatorList,
  useProblemTemplates,
  useAssignEvaluator,
} from "@/hooks/useEvaluations";
import { toast } from "sonner";

export function AssignEvaluatorModal({ isOpen, onClose, submission, onAssigned }) {
  const problemId = submission?.problemId?._id || submission?.problemId;
  const problemTitle = submission?.problemId?.title || "Challenge Statement";
  const orgName = submission?.organizationId?.name || "Candidate Startup";

  const { data: evaluators = [], isLoading: loadingEvaluators } = useEvaluatorList();
  const { data: templates = [], isLoading: loadingTemplates } = useProblemTemplates(problemId);
  const assignMutation = useAssignEvaluator();

  const [evaluatorId, setEvaluatorId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [deadline, setDeadline] = useState("");

  // Default deadline to 14 days from now
  useEffect(() => {
    if (isOpen) {
      const d = new Date();
      d.setDate(d.getDate() + 14);
      setDeadline(d.toISOString().split("T")[0]);
    }
  }, [isOpen]);

  // Pre-select first evaluator & template if available
  useEffect(() => {
    if (evaluators.length > 0 && !evaluatorId) {
      setEvaluatorId(evaluators[0]._id);
    }
  }, [evaluators, evaluatorId]);

  useEffect(() => {
    if (templates.length > 0 && !templateId) {
      setTemplateId(templates[0]._id);
    }
  }, [templates, templateId]);

  // Selected template details for live preview
  const selectedTemplate = useMemo(() => {
    return templates.find((t) => t._id === templateId) || templates[0];
  }, [templates, templateId]);

  const setDeadlineOffset = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setDeadline(d.toISOString().split("T")[0]);
  };

  const handleAssign = async (e) => {
    e.preventDefault();

    if (!evaluatorId) {
      toast.error("Please select an empaneled evaluator");
      return;
    }

    if (!templateId) {
      toast.error("Please select an evaluation template rubric");
      return;
    }

    if (!deadline) {
      toast.error("Please specify an evaluation deadline");
      return;
    }

    try {
      const isoDeadline = new Date(`${deadline}T23:59:59.000Z`).toISOString();
      await assignMutation.mutateAsync({
        submissionId: submission._id,
        evaluatorId,
        templateId,
        deadline: isoDeadline,
      });

      toast.success(
        `Technical evaluator assigned successfully under "${selectedTemplate?.title || "Rubric"}"`
      );
      onAssigned?.();
      onClose();
    } catch (err) {
      toast.error(
        err.message || err.details?.[0]?.message || err.response?.data?.error?.message || "Failed to assign evaluator"
      );
    }
  };

  if (!submission) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-6 bg-white border border-slate-200 shadow-xl rounded-xl">
        <DialogHeader className="pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#2563EB] uppercase tracking-wider">
            <span>Merit Evaluation Gate</span>
            <span className="text-slate-300">•</span>
            <span className="text-[#64748B]">Double-Blind Protocol</span>
          </div>
          <DialogTitle className="text-lg sm:text-xl font-bold text-[#10233F] mt-1">
            Assign Independent Technical Evaluator
          </DialogTitle>
          <div className="text-xs text-[#64748B] space-y-0.5 mt-1">
            <p className="line-clamp-1">
              <strong className="text-[#10233F]">Proposal:</strong> {submission.solutionTitle}
            </p>
            <p className="line-clamp-1">
              <strong className="text-[#10233F]">Applicant:</strong> {orgName}
            </p>
            <p className="line-clamp-1">
              <strong className="text-[#10233F]">Challenge:</strong> {problemTitle}
            </p>
          </div>
        </DialogHeader>

        <form onSubmit={handleAssign} className="space-y-4 pt-2">
          {/* Step 1: Evaluator Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#10233F]">
              1. Select Empaneled Technical Evaluator *
            </label>
            {loadingEvaluators ? (
              <div className="text-xs text-[#64748B] p-2">Loading empaneled evaluators...</div>
            ) : evaluators.length === 0 ? (
              <div className="p-3 border border-dashed border-amber-300 bg-amber-50 rounded text-xs text-amber-800">
                No active evaluators currently empaneled. A registered domain expert will be required.
              </div>
            ) : (
              <select
                value={evaluatorId}
                onChange={(e) => setEvaluatorId(e.target.value)}
                required
                className="w-full text-xs h-9 px-3 border border-slate-200 rounded bg-white text-[#10233F] focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {evaluators.map((ev) => (
                  <option key={ev._id} value={ev._id}>
                    {ev.name} &lt;{ev.email}&gt; {ev.department ? `(${ev.department})` : ""}
                  </option>
                ))}
              </select>
            )}
            <p className="text-[11px] text-[#64748B]">
              Evaluator will assess anonymized proposal dossiers without visibility into company founders.
            </p>
          </div>

          {/* Step 2: Evaluation Template Rubric Selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#10233F]">
                2. Select Evaluation Template Rubric *
              </label>
            </div>

            {loadingTemplates ? (
              <div className="text-xs text-[#64748B] p-2">Loading challenge rubrics...</div>
            ) : templates.length === 0 ? (
              <div className="p-3 border border-slate-200 bg-slate-50 rounded text-xs text-[#64748B]">
                Standard GFR 173(i) Technical Merit Rubric will be automatically generated upon selection.
              </div>
            ) : (
              <select
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                required
                className="w-full text-xs h-9 px-3 border border-slate-200 rounded bg-white text-[#10233F] focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {templates.map((tpl) => (
                  <option key={tpl._id} value={tpl._id}>
                    {tpl.title} ({(tpl.criteria || []).length} Criteria)
                  </option>
                ))}
              </select>
            )}

            {/* Live Criteria Preview */}
            {selectedTemplate && selectedTemplate.criteria && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  Rubric Criteria Breakdown ({selectedTemplate.title})
                </span>
                <div className="divide-y divide-slate-200/60 border border-slate-200 rounded bg-white text-xs">
                  {selectedTemplate.criteria.map((crit, idx) => (
                    <div
                      key={idx}
                      className="p-2 flex items-center justify-between gap-2"
                    >
                      <div className="space-y-0.5">
                        <p className="font-semibold text-[#10233F]">{crit.name}</p>
                        {crit.description && (
                          <p className="text-[11px] text-[#64748B] line-clamp-1">
                            {crit.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-[#10233F]">
                          {Math.round(crit.weight * 100)}%
                        </span>
                        <span className="text-[#64748B] text-[11px] block">
                          Max {crit.maxScore} pts
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Evaluation Deadline */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#10233F]">
              3. Evaluation Review Deadline *
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full sm:w-auto text-xs h-9 px-3 border border-slate-200 rounded bg-white text-[#10233F] focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setDeadlineOffset(7)}
                  className="px-2.5 py-1 border border-slate-200 rounded hover:bg-slate-50 text-[#64748B]"
                >
                  +7 Days
                </button>
                <button
                  type="button"
                  onClick={() => setDeadlineOffset(14)}
                  className="px-2.5 py-1 border border-slate-200 rounded hover:bg-slate-50 text-[#64748B]"
                >
                  +14 Days
                </button>
                <button
                  type="button"
                  onClick={() => setDeadlineOffset(30)}
                  className="px-2.5 py-1 border border-slate-200 rounded hover:bg-slate-50 text-[#64748B]"
                >
                  +30 Days
                </button>
              </div>
            </div>
          </div>

          {/* Statutory Notice */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
            <p className="font-semibold text-[#10233F]">
              Statutory Conflict-of-Interest (COI) Gate
            </p>
            <p className="text-[11px] text-[#64748B] leading-relaxed">
              Upon assignment dispatch, the technical evaluator receives an automated dossier alert. The scoring matrix will remain locked until the evaluator digitally affirms zero commercial or advisory conflict of interest under Maharashtra Procurement GR 2024.
            </p>
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs border-slate-300 h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={assignMutation.isPending || !evaluatorId || !templateId}
              className="text-xs bg-[#10233F] text-white hover:bg-slate-800 h-9 px-4 rounded"
            >
              {assignMutation.isPending
                ? "Assigning Evaluator..."
                : "Confirm Evaluator Assignment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AssignEvaluatorModal;
