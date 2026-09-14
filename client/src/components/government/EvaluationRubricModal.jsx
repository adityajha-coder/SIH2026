import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useProblemTemplates, useCreateTemplate } from "@/hooks/useEvaluations";
import { toast } from "sonner";

const RUBRIC_PRESETS = [
  {
    name: "Standard GFR 173(i) Merit Rubric",
    criteria: [
      {
        name: "Technical Architecture & Viability",
        description: "Codebase maturity, architecture resilience, and scalability under public infrastructure loads.",
        maxScore: 25,
        weight: 0.35,
      },
      {
        name: "Departmental KPI Alignment",
        description: "Direct efficacy in solving the stated departmental challenge and citizen service metrics.",
        maxScore: 25,
        weight: 0.25,
      },
      {
        name: "Pilot Feasibility & 90-Day Deployment",
        description: "Operational readiness to execute a sandbox field deployment without extensive legacy retrofitting.",
        maxScore: 25,
        weight: 0.25,
      },
      {
        name: "Sovereignty & Security Compliance",
        description: "Data localization within India, zero proprietary cloud lock-in, and CERT-In compliance.",
        maxScore: 25,
        weight: 0.15,
      },
    ],
  },
  {
    name: "DeepTech Hardware & IoT Pilot Rubric",
    criteria: [
      {
        name: "Hardware & Sensor Field Resilience",
        description: "Operating endurance under Indian climatic conditions, power variations, and rugged field tests.",
        maxScore: 30,
        weight: 0.40,
      },
      {
        name: "Indigenous Manufacturing & Bill of Materials",
        description: "Domestic sourcing ratio, supply-chain resilience, and ease of local maintenance.",
        maxScore: 25,
        weight: 0.30,
      },
      {
        name: "Lifecycle Cost & Unit Economics",
        description: "Procurement cost versus operational savings compared to legacy government alternatives.",
        maxScore: 25,
        weight: 0.20,
      },
      {
        name: "Field Safety & Hardware Certifications",
        description: "BIS, RoHS, or equivalent safety and electrical hazard clearances.",
        maxScore: 20,
        weight: 0.10,
      },
    ],
  },
  {
    name: "Civic Software & Citizen Access Rubric",
    criteria: [
      {
        name: "Architecture Resilience & Throughput",
        description: "Ability to handle high concurrent municipal transactions with low latency.",
        maxScore: 30,
        weight: 0.35,
      },
      {
        name: "Citizen Data Privacy & Digital Sovereignty",
        description: "Compliance with DPDP Act 2023, sovereign encryption, and zero third-party data tracking.",
        maxScore: 30,
        weight: 0.35,
      },
      {
        name: "Multilingual Reach & Accessibility",
        description: "WCAG 2.1 AA compliance, Marathi/Hindi localization, and lightweight mobile access.",
        maxScore: 20,
        weight: 0.20,
      },
      {
        name: "Interoperability & Open APIs",
        description: "Compatibility with India Stack (Aadhaar, DigiLocker, UPI, PM GatiShakti).",
        maxScore: 20,
        weight: 0.10,
      },
    ],
  },
];

export function EvaluationRubricModal({ isOpen, onClose, problem }) {
  const problemId = problem?._id;
  const { data: templates = [], isLoading } = useProblemTemplates(problemId);
  const createTemplateMutation = useCreateTemplate();

  const [activeTab, setActiveTab] = useState("view"); // "view" | "create"
  const [templateTitle, setTemplateTitle] = useState("");
  const [criteriaList, setCriteriaList] = useState([
    {
      name: "Technical Architecture & Viability",
      description: "Codebase maturity and architectural soundness.",
      maxScore: 25,
      weight: 0.40,
    },
    {
      name: "Departmental Outcome Alignment",
      description: "Direct efficacy in meeting problem KPIs.",
      maxScore: 25,
      weight: 0.30,
    },
    {
      name: "Sandbox Pilot Readiness",
      description: "Ability to deploy within 90 days.",
      maxScore: 25,
      weight: 0.30,
    },
  ]);

  // Compute total weight
  const totalWeight = useMemo(() => {
    const sum = criteriaList.reduce((acc, c) => acc + (parseFloat(c.weight) || 0), 0);
    return Math.round(sum * 100);
  }, [criteriaList]);

  const handleApplyPreset = (preset) => {
    setTemplateTitle(preset.name);
    setCriteriaList(
      preset.criteria.map((c) => ({
        name: c.name,
        description: c.description,
        maxScore: c.maxScore,
        weight: c.weight,
      }))
    );
    toast.success(`Loaded preset: "${preset.name}"`);
  };

  const handleAddCriterion = () => {
    setCriteriaList((prev) => [
      ...prev,
      {
        name: "",
        description: "",
        maxScore: 25,
        weight: 0.10,
      },
    ]);
  };

  const handleRemoveCriterion = (idx) => {
    if (criteriaList.length <= 1) {
      toast.error("At least one evaluation criterion is required");
      return;
    }
    setCriteriaList((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateCriterion = (idx, field, value) => {
    setCriteriaList((prev) =>
      prev.map((c, i) => {
        if (i !== idx) return c;
        return {
          ...c,
          [field]: field === "maxScore" ? Number(value) : field === "weight" ? parseFloat(value) || 0 : value,
        };
      })
    );
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    if (!templateTitle.trim() || templateTitle.trim().length < 3) {
      toast.error("Rubric title must be at least 3 characters");
      return;
    }

    for (let i = 0; i < criteriaList.length; i++) {
      const c = criteriaList[i];
      if (!c.name.trim()) {
        toast.error(`Criterion #${i + 1} requires a valid title`);
        return;
      }
      if (!c.maxScore || c.maxScore < 1) {
        toast.error(`Criterion "${c.name}" must have a max score of at least 1`);
        return;
      }
      if (c.weight <= 0 || c.weight > 1) {
        toast.error(`Criterion "${c.name}" weight must be between 0.01 and 1.00`);
        return;
      }
    }

    if (totalWeight < 98 || totalWeight > 102) {
      toast.error(`Total weights must sum to 100% (Current sum: ${totalWeight}%)`);
      return;
    }

    try {
      await createTemplateMutation.mutateAsync({
        problemId,
        title: templateTitle.trim(),
        criteria: criteriaList.map((c) => ({
          name: c.name.trim(),
          description: c.description?.trim() || "",
          maxScore: Math.round(c.maxScore),
          weight: Number(c.weight),
        })),
      });

      toast.success(`Evaluation rubric "${templateTitle.trim()}" published successfully`);
      setActiveTab("view");
      setTemplateTitle("");
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Failed to save rubric template");
    }
  };

  if (!problem) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-6 bg-white border border-slate-200 shadow-xl rounded-xl">
        <DialogHeader className="pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#2563EB] uppercase tracking-wider">
            <span>Evaluation Protocol</span>
            <span className="text-slate-300">•</span>
            <span className="text-[#64748B]">GFR 173(i) Scoring Rubric</span>
          </div>
          <DialogTitle className="text-lg sm:text-xl font-bold text-[#10233F] mt-1">
            Evaluation Rubric Configuration
          </DialogTitle>
          <p className="text-xs text-[#64748B] line-clamp-1">
            Challenge: {problem.title}
          </p>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 pt-2 pb-1 border-b border-slate-100">
          <button
            type="button"
            onClick={() => setActiveTab("view")}
            className={`text-xs font-semibold px-3 py-1.5 rounded transition-colors ${
              activeTab === "view"
                ? "bg-slate-100 text-[#10233F]"
                : "text-[#64748B] hover:text-[#10233F]"
            }`}
          >
            Active Rubrics ({templates.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("create")}
            className={`text-xs font-semibold px-3 py-1.5 rounded transition-colors ${
              activeTab === "create"
                ? "bg-slate-100 text-[#10233F]"
                : "text-[#64748B] hover:text-[#10233F]"
            }`}
          >
            + Formulate New Rubric
          </button>
        </div>

        {/* View Active Rubrics Tab */}
        {activeTab === "view" && (
          <div className="space-y-4 py-2">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-[#64748B]">
                Loading evaluation rubrics...
              </div>
            ) : templates.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-lg bg-slate-50 space-y-2">
                <p className="text-xs font-semibold text-[#10233F]">
                  No custom rubric configured for this challenge statement.
                </p>
                <p className="text-xs text-[#64748B]">
                  Click "Formulate New Rubric" above to select a statutory GFR 173(i) preset or create custom criteria.
                </p>
                <Button
                  size="sm"
                  type="button"
                  onClick={() => setActiveTab("create")}
                  className="text-xs bg-[#10233F] text-white hover:bg-slate-800 h-8 px-3 mt-2"
                >
                  + Formulate Rubric
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {templates.map((tpl) => (
                  <div
                    key={tpl._id}
                    className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <h4 className="font-bold text-sm text-[#10233F]">
                          {tpl.title}
                        </h4>
                        <p className="text-[11px] text-[#64748B]">
                          Configured on:{" "}
                          {new Date(tpl.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded self-start sm:self-auto">
                        Active Rubric
                      </span>
                    </div>

                    <div className="border border-slate-200 rounded overflow-hidden bg-white">
                      <div className="grid grid-cols-12 text-[11px] font-bold text-[#64748B] bg-slate-100 p-2.5 border-b border-slate-200">
                        <div className="col-span-6">Criterion & Description</div>
                        <div className="col-span-3 text-center">Weight</div>
                        <div className="col-span-3 text-right">Max Score</div>
                      </div>
                      <div className="divide-y divide-slate-100 text-xs">
                        {(tpl.criteria || []).map((crit, cIdx) => (
                          <div
                            key={cIdx}
                            className="grid grid-cols-12 p-2.5 items-center text-slate-700"
                          >
                            <div className="col-span-6 pr-2">
                              <p className="font-semibold text-[#10233F]">
                                {crit.name}
                              </p>
                              {crit.description && (
                                <p className="text-[11px] text-[#64748B] line-clamp-1">
                                  {crit.description}
                                </p>
                              )}
                            </div>
                            <div className="col-span-3 text-center font-medium">
                              {Math.round(crit.weight * 100)}%
                            </div>
                            <div className="col-span-3 text-right font-medium text-[#10233F]">
                              {crit.maxScore} pts
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create New Rubric Tab */}
        {activeTab === "create" && (
          <form onSubmit={handleSaveTemplate} className="space-y-4 py-2">
            {/* Quick Presets */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                Select Pre-Configured Rubric Template
              </span>
              <div className="flex flex-wrap gap-2">
                {RUBRIC_PRESETS.map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="text-xs font-medium border border-slate-300 bg-white hover:border-[#10233F] px-2.5 py-1.5 rounded transition-colors text-[#10233F]"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Rubric Title */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#10233F]">
                Rubric Title *
              </label>
              <input
                type="text"
                required
                value={templateTitle}
                onChange={(e) => setTemplateTitle(e.target.value)}
                placeholder="e.g., GFR 173(i) Autonomous Drone Pilot Rubric"
                className="w-full text-xs h-9 px-3 border border-slate-200 rounded bg-white text-[#10233F] focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Dynamic Criteria List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#10233F]">
                  Evaluation Criteria & Scoring Weights
                </label>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                    totalWeight === 100
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  Total Weight: {totalWeight}% (Target: 100%)
                </span>
              </div>

              <div className="space-y-3">
                {criteriaList.map((crit, idx) => (
                  <div
                    key={idx}
                    className="p-3 border border-slate-200 rounded bg-white space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-[#64748B]">
                        Criterion #{idx + 1}
                      </span>
                      {criteriaList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCriterion(idx)}
                          className="text-xs text-rose-600 hover:text-rose-800 font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                      <div className="sm:col-span-6 space-y-1">
                        <label className="text-[11px] font-medium text-[#64748B]">
                          Criterion Name
                        </label>
                        <input
                          type="text"
                          required
                          value={crit.name}
                          onChange={(e) =>
                            handleUpdateCriterion(idx, "name", e.target.value)
                          }
                          placeholder="e.g., Technical Architecture"
                          className="w-full text-xs h-8 px-2.5 border border-slate-200 rounded bg-white text-[#10233F] focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div className="sm:col-span-3 space-y-1">
                        <label className="text-[11px] font-medium text-[#64748B]">
                          Weight Ratio (0.01 - 1.0)
                        </label>
                        <input
                          type="number"
                          step="0.05"
                          min="0.01"
                          max="1.0"
                          value={crit.weight}
                          onChange={(e) =>
                            handleUpdateCriterion(idx, "weight", e.target.value)
                          }
                          className="w-full text-xs h-8 px-2.5 border border-slate-200 rounded bg-white text-[#10233F] focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div className="sm:col-span-3 space-y-1">
                        <label className="text-[11px] font-medium text-[#64748B]">
                          Max Score (Points)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={crit.maxScore}
                          onChange={(e) =>
                            handleUpdateCriterion(idx, "maxScore", e.target.value)
                          }
                          className="w-full text-xs h-8 px-2.5 border border-slate-200 rounded bg-white text-[#10233F] focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[#64748B]">
                        Guidance Description for Technical Evaluator
                      </label>
                      <input
                        type="text"
                        value={crit.description}
                        onChange={(e) =>
                          handleUpdateCriterion(idx, "description", e.target.value)
                        }
                        placeholder="Evaluation instructions or requirements to inspect..."
                        className="w-full text-xs h-8 px-2.5 border border-slate-200 rounded bg-white text-[#10233F] focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCriterion}
                className="text-xs border-slate-300 text-[#10233F] hover:bg-slate-50 h-8"
              >
                + Add Another Criterion
              </Button>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("view")}
                className="text-xs border-slate-300 h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createTemplateMutation.isPending}
                className="text-xs bg-[#10233F] text-white hover:bg-slate-800 h-9 px-4 rounded"
              >
                {createTemplateMutation.isPending
                  ? "Publishing Rubric..."
                  : "Save Evaluation Rubric"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default EvaluationRubricModal;
