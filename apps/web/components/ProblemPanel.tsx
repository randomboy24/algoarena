"use client";

import { CheckCircle, AlertCircle, BarChart3 } from "lucide-react";
import { useState } from "react";

const difficultyConfig = {
  EASY: {
    color: "text-emerald-500 bg-emerald-500/10",
    icon: CheckCircle,
    label: "Easy",
    borderColor: "border-emerald-500/20",
  },
  MEDIUM: {
    color: "text-amber-500 bg-amber-500/10",
    icon: BarChart3,
    label: "Medium",
    borderColor: "border-amber-500/20",
  },
  HARD: {
    color: "text-rose-500 bg-rose-500/10",
    icon: AlertCircle,
    label: "Hard",
    borderColor: "border-rose-500/20",
  },
};

interface ProblemPanelProps {
  problem: {
    title: string;
    difficulty: keyof typeof difficultyConfig;
    description: string;
    examples: Array<{
      input: string;
      output: string;
      explanation?: string;
    }>;
    constraints: {
        description: string
    }[];
  };
}

export function ProblemPanel({ problem }: ProblemPanelProps) {
  const [activeTab, setActiveTab] = useState<"description" | "solution">(
    "description",
  );
  const Difficulty = difficultyConfig[problem.difficulty];

  return (
    <div className="h-full bg-[#0A1929] border-r border-[#1E2A3A] flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-[#0A1929] border-b border-[#1E2A3A] px-6 py-4 z-10">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-semibold text-white">{problem.title}</h1>
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${Difficulty.color}`}
          >
            <Difficulty.icon className="w-3.5 h-3.5" />
            {Difficulty.label}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("description")}
            className={`text-sm pb-2 border-b-2 transition-colors ${
              activeTab === "description"
                ? "text-[#3B82F6] border-[#3B82F6]"
                : "text-[#6B7280] border-transparent hover:text-[#9CA3AF]"
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab("solution")}
            className={`text-sm pb-2 border-b-2 transition-colors ${
              activeTab === "solution"
                ? "text-[#3B82F6] border-[#3B82F6]"
                : "text-[#6B7280] border-transparent hover:text-[#9CA3AF]"
            }`}
          >
            Solution
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#1E2A3A] scrollbar-track-transparent">
        {activeTab === "description" ? (
          <div className="px-6 py-4">
            {/* Description */}
            <div className="prose prose-invert max-w-none">
              <p className="text-[#9CA3AF] whitespace-pre-line leading-relaxed">
                {problem.description}
              </p>
            </div>

            {/* Examples */}
            <div className="mt-6 space-y-4">
              <h3 className="text-sm font-medium text-white">Examples</h3>
              {problem.examples.map((example, idx) => (
                <div
                  key={idx}
                  className="bg-[#1E2A3A] rounded-lg border border-[#374151] overflow-hidden"
                >
                  <div className="px-4 py-3 bg-[#0A1929]/50 border-b border-[#374151]">
                    <span className="text-xs font-medium text-[#9CA3AF]">
                      Example {idx + 1}:
                    </span>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <span className="text-xs font-medium text-[#6B7280] block mb-1">
                        Input:
                      </span>
                      <code className="text-sm text-[#A78BFA] bg-[#0A1929] px-3 py-2 rounded-lg block border border-[#374151]">
                        {example.input}
                      </code>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-[#6B7280] block mb-1">
                        Output:
                      </span>
                      <code className="text-sm text-[#FCD34D] bg-[#0A1929] px-3 py-2 rounded-lg block border border-[#374151]">
                        {example.output}
                      </code>
                    </div>
                    {example.explanation && (
                      <div>
                        <span className="text-xs font-medium text-[#6B7280] block mb-1">
                          Explanation:
                        </span>
                        <p className="text-sm text-[#9CA3AF]">
                          {example.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Constraints */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-white mb-3">
                Constraints:
              </h3>
              <ul className="space-y-2">
                {problem.constraints.map((constraint, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-[#3B82F6] mt-1">•</span>
                    <code className="text-[#9CA3AF]">{constraint.description}</code>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="px-6 py-4">
            <p className="text-[#9CA3AF]">Solutions will be displayed here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
