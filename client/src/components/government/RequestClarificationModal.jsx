import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTransitionSubmission } from "@/hooks/useSubmissions";
import { toast } from "sonner";
import { HelpCircle, Send, Loader2 } from "lucide-react";

export function RequestClarificationModal({ isOpen, onClose, submission, onSuccess }) {
  const [query, setQuery] = useState("");
  const transitionMutation = useTransitionSubmission();

  if (!submission) return null;

  const orgName = submission.organizationId?.name || "Candidate Startup";
  const probTitle = submission.problemId?.title || "Challenge Statement";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || query.trim().length < 10) {
      toast.error("Please provide a detailed clarification query (at least 10 characters).");
      return;
    }

    try {
      await transitionMutation.mutateAsync({
        id: submission._id,
        toStatus: "CLARIFICATION",
        note: query.trim(),
      });
      toast.success(`Clarification request dispatched to ${orgName}`);
      setQuery("");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || err.message || "Failed to request clarification");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-6 bg-white border border-slate-200 shadow-xl rounded-xl">
        <DialogHeader className="pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 uppercase tracking-wider">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Proposal Screening Gate</span>
            <span className="text-slate-300">•</span>
            <span className="text-[#64748B]">Stage 4 Clarification</span>
          </div>
          <DialogTitle className="text-lg font-bold text-[#10233F] mt-1">
            Request Technical Clarification
          </DialogTitle>
          <DialogDescription className="text-xs text-[#64748B]">
            Submit formal queries regarding methodology, evidence, or statutory compliance before proceeding with evaluator scoring.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs space-y-1 mt-2">
          <div className="text-slate-700">
            <strong className="text-[#10233F]">Proposal:</strong> {submission.solutionTitle}
          </div>
          <div className="text-slate-700">
            <strong className="text-[#10233F]">Applicant:</strong> {orgName}
          </div>
          <div className="text-slate-700">
            <strong className="text-[#10233F]">Challenge:</strong> {probTitle}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#10233F]">
              Specific Clarification Query / Missing Requirement *
            </label>
            <textarea
              rows={4}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Please clarify your data residency architecture within Maharashtra SDC, or provide certified test logs demonstrating TRL-4 field telemetry under 500ms latency."
              className="w-full text-xs p-3 border border-slate-200 rounded-lg bg-white text-[#10233F] focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400 leading-relaxed"
              required
            />
            <p className="text-[11px] text-[#64748B]">
              This query will be transmitted via email and highlighted on the startup's proposal dashboard.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs border-slate-300 text-slate-700 h-9 px-3 rounded cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={transitionMutation.isPending}
              className="text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white h-9 px-4 rounded gap-1.5 cursor-pointer shadow-xs"
            >
              {transitionMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Dispatching...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Dispatch Request
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default RequestClarificationModal;
