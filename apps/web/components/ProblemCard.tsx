"use client";

import { useRouter } from "next/navigation";
import { Clock, CheckCircle, AlertCircle, BarChart3 } from "lucide-react";

// Difficulty icons and colors mapping
const difficultyConfig = {
  EASY: {
    color: "text-emerald-500 bg-emerald-500/10",
    icon: CheckCircle,
    label: "Easy",
  },
  MEDIUM: {
    color: "text-amber-500 bg-amber-500/10",
    icon: BarChart3,
    label: "Medium",
  },
  HARD: {
    color: "text-rose-500 bg-rose-500/10",
    icon: AlertCircle,
    label: "Hard",
  },
};

interface ProblemCardProps {
  problem: {
    id: string;
    title: string;
    slug: string;
    description: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    submissionCount: number;
  };
  acceptance: string;
}

export function ProblemCard({ problem, acceptance }: ProblemCardProps) {
  const router = useRouter();
  const DifficultyIcon = difficultyConfig[problem.difficulty].icon;
  const difficultyColor = difficultyConfig[problem.difficulty].color;

  const handleClick = () => {
    router.push(`/problems/${problem.slug}`);
  };

  return (
    <div
      onClick={handleClick}
      className="group grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#374151] last:border-0 hover:bg-[#374151]/30 transition-all duration-200 cursor-pointer"
    >
      {/* Status */}
      <div className="col-span-1 flex items-center">
        <div className="w-5 h-5 rounded-full border-2 border-[#374151] group-hover:border-[#3B82F6] transition-colors duration-200" />
      </div>

      {/* Title and Description */}
      <div className="col-span-5">
        <h3 className="text-white font-medium group-hover:text-[#3B82F6] transition-colors duration-200">
          {problem.title}
        </h3>
        <p className="text-sm text-[#6B7280] line-clamp-1 mt-0.5">
          {problem.description}
        </p>
      </div>

      {/* Difficulty */}
      <div className="col-span-2 flex items-center">
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${difficultyColor}`}
        >
          <DifficultyIcon className="w-3.5 h-3.5" />
          {difficultyConfig[problem.difficulty].label}
        </div>
      </div>

      {/* Acceptance */}
      <div className="col-span-2 flex items-center">
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-[#374151] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#10B981] rounded-full"
              style={{ width: acceptance }}
            />
          </div>
          <span className="text-sm text-[#9CA3AF]">{acceptance}</span>
        </div>
      </div>

      {/* Submissions */}
      <div className="col-span-2 flex items-center gap-2">
        <Clock className="w-4 h-4 text-[#6B7280]" />
        <span className="text-sm text-[#9CA3AF]">
          {problem.submissionCount}
        </span>
      </div>
    </div>
  );
}
