"use client";

import { useMemo, useState } from "react";
import { Code2, Filter } from "lucide-react";
import { ProblemCard } from "./ProblemCard";

interface Problem {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  submissionCount: number;
  acceptanceRate: string;
}

interface ProblemsListProps {
  problems: Problem[];
}

export function ProblemsList({ problems }: ProblemsListProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(
    null,
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter problems based on selected difficulty
  const filteredProblems = useMemo(() => {
    if (!selectedDifficulty) return problems;
    return problems.filter((p) => p.difficulty === selectedDifficulty);
  }, [problems, selectedDifficulty]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: problems.length,
      easy: problems.filter((p) => p.difficulty === "EASY").length,
      medium: problems.filter((p) => p.difficulty === "MEDIUM").length,
      hard: problems.filter((p) => p.difficulty === "HARD").length,
    };
  }, [problems]);

  return (
    <main className="min-h-screen bg-[#0A1929]">
      {/* Header Section */}
      <div className="border-b border-[#1E2A3A] bg-[#0A1929]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Title */}
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-medium text-white">Problems</h1>
              <span className="text-xs text-[#6B7280] ml-2">
                ({filteredProblems.length})
              </span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 text-xs">
              <span className="text-[#9CA3AF]">
                Easy:{" "}
                <span className="text-[#10B981] font-medium">{stats.easy}</span>
              </span>
              <span className="text-[#374151]">•</span>
              <span className="text-[#9CA3AF]">
                Medium:{" "}
                <span className="text-[#F59E0B] font-medium">
                  {stats.medium}
                </span>
              </span>
              <span className="text-[#374151]">•</span>
              <span className="text-[#9CA3AF]">
                Hard:{" "}
                <span className="text-[#EF4444] font-medium">{stats.hard}</span>
              </span>
            </div>

            {/* Filter Button with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="p-2 bg-[#1E2A3A] border border-[#374151] rounded-lg hover:bg-[#374151] transition-colors duration-200 group"
              >
                <Filter className="w-4 h-4 text-[#6B7280] group-hover:text-[#3B82F6]" />
              </button>

              {/* Filter Dropdown */}
              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#1E2A3A] border border-[#374151] rounded-lg shadow-lg z-10">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setSelectedDifficulty(null);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                        selectedDifficulty === null
                          ? "bg-[#3B82F6] text-white"
                          : "text-[#9CA3AF] hover:bg-[#374151]"
                      }`}
                    >
                      All Difficulties
                    </button>

                    <button
                      onClick={() => {
                        setSelectedDifficulty("EASY");
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                        selectedDifficulty === "EASY"
                          ? "bg-[#10B981] text-white"
                          : "text-[#9CA3AF] hover:bg-[#374151]"
                      }`}
                    >
                      Easy
                    </button>

                    <button
                      onClick={() => {
                        setSelectedDifficulty("MEDIUM");
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                        selectedDifficulty === "MEDIUM"
                          ? "bg-[#F59E0B] text-white"
                          : "text-[#9CA3AF] hover:bg-[#374151]"
                      }`}
                    >
                      Medium
                    </button>

                    <button
                      onClick={() => {
                        setSelectedDifficulty("HARD");
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                        selectedDifficulty === "HARD"
                          ? "bg-[#EF4444] text-white"
                          : "text-[#9CA3AF] hover:bg-[#374151]"
                      }`}
                    >
                      Hard
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Problems Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-[#1E2A3A] rounded-xl border border-[#374151] overflow-hidden shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#374151] bg-[#0A1929]/50">
            <div className="col-span-1 text-sm font-medium text-[#9CA3AF]">
              Status
            </div>
            <div className="col-span-5 text-sm font-medium text-[#9CA3AF]">
              Title
            </div>
            <div className="col-span-2 text-sm font-medium text-[#9CA3AF]">
              Difficulty
            </div>
            <div className="col-span-2 text-sm font-medium text-[#9CA3AF]">
              Acceptance
            </div>
            <div className="col-span-2 text-sm font-medium text-[#9CA3AF]">
              Submissions
            </div>
          </div>

          {/* Problem Rows */}
          {filteredProblems.length > 0 ? (
            filteredProblems.map((problem) => (
              <ProblemCard
                key={problem.id}
                problem={problem}
                acceptance={problem.acceptanceRate}
              />
            ))
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1E2A3A] mb-4">
                <Code2 className="w-8 h-8 text-[#6B7280]" />
              </div>
              <h3 className="text-white font-medium mb-2">No problems found</h3>
              <p className="text-[#6B7280] text-sm">
                Try adjusting your filters
              </p>
            </div>
          )}
        </div>

        {/* Empty State */}
        {problems.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1E2A3A] mb-4">
              <Code2 className="w-8 h-8 text-[#6B7280]" />
            </div>
            <h3 className="text-white font-medium mb-2">No problems yet</h3>
            <p className="text-[#6B7280] text-sm">
              Check back later for new challenges
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
