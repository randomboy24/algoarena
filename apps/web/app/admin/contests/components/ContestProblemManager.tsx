"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Loader2,
  GripVertical,
  Search,
  ChevronDown,
} from "lucide-react";

type Problem = {
  id: string;
  title: string;
  difficulty: string;
  isPublic: boolean;
};

type ContestProblem = {
  id: string;
  problemId: string;
  points: number;
  order: number;
  makePublicAfter: boolean;
  problem: Problem;
};

type ContestProblemManagerProps = {
  contestId: string;
  contestProblems: ContestProblem[];
  availableProblems: Problem[];
};

export function ContestProblemManager({
  contestId,
  contestProblems,
  availableProblems,
}: ContestProblemManagerProps) {
  const router = useRouter();
  const [problems, setProblems] = useState<ContestProblem[]>(contestProblems);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Add problem form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProblemId, setSelectedProblemId] = useState("");
  const [points, setPoints] = useState(100);
  const [makePublicAfter, setMakePublicAfter] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter out problems already in contest
  const problemIdsInContest = new Set(problems.map((p) => p.problemId));
  const filteredAvailableProblems = availableProblems.filter(
    (p) =>
      !problemIdsInContest.has(p.id) &&
      p.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAddProblem = async () => {
    if (!selectedProblemId) return;

    setLoading("add");
    setError(null);

    try {
      const newOrder = problems.length + 1;
      const res = await fetch(`/api/v1/admin/contests/${contestId}/problems`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: selectedProblemId,
          points,
          order: newOrder,
          makePublicAfter,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to add problem");
      }

      setProblems([...problems, data.contestProblem]);
      setShowAddForm(false);
      setSelectedProblemId("");
      setPoints(100);
      setMakePublicAfter(false);
      setSearchTerm("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  };

  const handleRemoveProblem = async (problemId: string) => {
    if (!confirm("Remove this problem from the contest?")) return;

    setLoading(problemId);
    setError(null);

    try {
      const res = await fetch(
        `/api/v1/admin/contests/${contestId}/problems/${problemId}`,
        { method: "DELETE" },
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to remove problem");
      }

      setProblems(problems.filter((p) => p.problemId !== problemId));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  };

  const handleUpdateProblem = async (
    problemId: string,
    updates: { points?: number; order?: number; makePublicAfter?: boolean },
  ) => {
    setLoading(problemId);
    setError(null);

    try {
      const res = await fetch(
        `/api/v1/admin/contests/${contestId}/problems/${problemId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update problem");
      }

      setProblems(
        problems.map((p) =>
          p.problemId === problemId ? { ...p, ...updates } : p,
        ),
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "text-[#10B981]";
      case "MEDIUM":
        return "text-[#F59E0B]";
      case "HARD":
        return "text-[#EF4444]";
      default:
        return "text-[#94A3B8]";
    }
  };

  const getProblemLabel = (index: number) => {
    return String.fromCharCode(65 + index); // A, B, C, ...
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Problem List */}
      <div className="space-y-2">
        {problems
          .sort((a, b) => a.order - b.order)
          .map((cp, index) => (
            <div
              key={cp.id}
              className="flex items-center gap-4 p-4 rounded-lg bg-[#0B1B2D] border border-[#1E2A3A]"
            >
              <div className="flex items-center gap-2 text-[#64748B]">
                <GripVertical className="w-4 h-4" />
                <span className="w-6 h-6 rounded bg-[#1E2A3A] flex items-center justify-center text-xs font-medium text-white">
                  {getProblemLabel(index)}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white truncate">
                    {cp.problem.title}
                  </span>
                  <span
                    className={`text-xs ${getDifficultyColor(cp.problem.difficulty)}`}
                  >
                    {cp.problem.difficulty}
                  </span>
                  {!cp.problem.isPublic && (
                    <span className="text-xs px-2 py-0.5 rounded bg-[#1E2A3A] text-[#64748B]">
                      Contest Only
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-[#64748B]">Points:</label>
                  <input
                    type="number"
                    value={cp.points}
                    onChange={(e) =>
                      handleUpdateProblem(cp.problemId, {
                        points: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-20 px-2 py-1 rounded bg-[#0F2235] border border-[#1E2A3A] text-white text-sm focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>

                {!cp.problem.isPublic && (
                  <label className="flex items-center gap-2 text-xs text-[#64748B] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cp.makePublicAfter}
                      onChange={(e) =>
                        handleUpdateProblem(cp.problemId, {
                          makePublicAfter: e.target.checked,
                        })
                      }
                      className="rounded border-[#1E2A3A] bg-[#0F2235] text-[#3B82F6] focus:ring-[#3B82F6]"
                    />
                    Make public after
                  </label>
                )}

                <button
                  onClick={() => handleRemoveProblem(cp.problemId)}
                  disabled={loading === cp.problemId}
                  className="p-2 rounded hover:bg-[#1E2A3A] text-[#64748B] hover:text-red-400 transition-colors disabled:opacity-50"
                >
                  {loading === cp.problemId ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}

        {problems.length === 0 && !showAddForm && (
          <div className="text-center py-8 text-sm text-[#64748B]">
            No problems added yet. Add problems to this contest.
          </div>
        )}
      </div>

      {/* Add Problem Form */}
      {showAddForm ? (
        <div className="p-4 rounded-lg bg-[#0B1B2D] border border-[#3B82F6] space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-white">Add Problem</h4>
            <button
              onClick={() => {
                setShowAddForm(false);
                setSelectedProblemId("");
                setSearchTerm("");
              }}
              className="text-xs text-[#64748B] hover:text-white"
            >
              Cancel
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search problems..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#0F2235] border border-[#1E2A3A] text-white placeholder-[#64748B] text-sm focus:outline-none focus:border-[#3B82F6]"
            />
          </div>

          {/* Problem Select */}
          <div className="max-h-48 overflow-y-auto rounded-lg border border-[#1E2A3A]">
            {filteredAvailableProblems.length === 0 ? (
              <div className="p-4 text-center text-sm text-[#64748B]">
                No problems available
              </div>
            ) : (
              filteredAvailableProblems.map((problem) => (
                <button
                  key={problem.id}
                  onClick={() => setSelectedProblemId(problem.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#0F2235] transition-colors ${
                    selectedProblemId === problem.id
                      ? "bg-[#0F2235] border-l-2 border-[#3B82F6]"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white">{problem.title}</span>
                    {!problem.isPublic && (
                      <span className="text-xs px-2 py-0.5 rounded bg-[#1E2A3A] text-[#64748B]">
                        Private
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-xs ${getDifficultyColor(problem.difficulty)}`}
                  >
                    {problem.difficulty}
                  </span>
                </button>
              ))
            )}
          </div>

          {/* Points & Options */}
          {selectedProblemId && (
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-[#64748B]">Points:</label>
                <input
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                  className="w-24 px-3 py-2 rounded-lg bg-[#0F2235] border border-[#1E2A3A] text-white text-sm focus:outline-none focus:border-[#3B82F6]"
                />
              </div>

              {availableProblems.find((p) => p.id === selectedProblemId)
                ?.isPublic === false && (
                <label className="flex items-center gap-2 text-sm text-[#64748B] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={makePublicAfter}
                    onChange={(e) => setMakePublicAfter(e.target.checked)}
                    className="rounded border-[#1E2A3A] bg-[#0F2235] text-[#3B82F6] focus:ring-[#3B82F6]"
                  />
                  Make public after contest ends
                </label>
              )}

              <button
                onClick={handleAddProblem}
                disabled={loading === "add"}
                className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3B82F6] text-sm font-medium text-white hover:bg-[#2563EB] transition-colors disabled:opacity-50"
              >
                {loading === "add" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Add Problem
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-dashed border-[#1E2A3A] text-sm text-[#64748B] hover:text-white hover:border-[#3B82F6] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Problem
        </button>
      )}
    </div>
  );
}
