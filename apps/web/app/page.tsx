import { prisma } from "@repo/database";
import { Code2, Filter } from "lucide-react";
import { ProblemCard } from "../components/ProblemCard";

// Helper function to calculate acceptance rate
async function getAcceptanceRate(problemId: string) {
  const totalSubmissions = await prisma.submission.count({
    where: { problemId },
  });

  const acceptedSubmissions = await prisma.submission.count({
    where: {
      problemId,
      status: "PASSED", // Adjust based on your status enum
    },
  });

  if (totalSubmissions === 0) return "0%";
  return `${Math.round((acceptedSubmissions / totalSubmissions) * 100)}%`;
}

export default async function IndexPage() {
  const problems = await prisma.problem.findMany();

  // console.log(problem);

  // Get submission counts and acceptance rates for all problems
  const problemsWithStats = await Promise.all(
    problems.map(async (problem) => {
      const submissionCount = await prisma.submission.count({
        where: { problemId: problem.id },
      });

      const acceptanceRate = await getAcceptanceRate(problem.id);

      return {
        ...problem,
        submissionCount,
        acceptanceRate,
      };
    }),
  );

  // Calculate stats for header
  const totalProblems = problems.length;
  const easyCount = problems.filter((p) => p.difficulty === "EASY").length;
  const mediumCount = problems.filter((p) => p.difficulty === "MEDIUM").length;
  const hardCount = problems.filter((p) => p.difficulty === "HARD").length;

  return (
    <main className="min-h-screen bg-[#0A1929]">
      {/* Header Section */}
      <div className="border-b border-[#1E2A3A] bg-[#0A1929]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Title */}
            <div className="flex items-center gap-2">
              {/* <Code2 className="w-5 h-5 text-[#3B82F6]" /> */}
              <h1 className="text-lg font-medium text-white">Problems</h1>
              <span className="text-xs text-[#6B7280] ml-2">
                ({totalProblems})
              </span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 text-xs">
              <span className="text-[#9CA3AF]">
                Easy:{" "}
                <span className="text-[#10B981] font-medium">{easyCount}</span>
              </span>
              <span className="text-[#374151]">•</span>
              <span className="text-[#9CA3AF]">
                Medium:{" "}
                <span className="text-[#F59E0B] font-medium">
                  {mediumCount}
                </span>
              </span>
              <span className="text-[#374151]">•</span>
              <span className="text-[#9CA3AF]">
                Hard:{" "}
                <span className="text-[#EF4444] font-medium">{hardCount}</span>
              </span>
            </div>

            {/* Filter Button */}
            <button className="p-2 bg-[#1E2A3A] border border-[#374151] rounded-lg hover:bg-[#374151] transition-colors duration-200 group">
              <Filter className="w-4 h-4 text-[#6B7280] group-hover:text-[#3B82F6]" />
            </button>
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
          {problemsWithStats.map((problem) => (
            <ProblemCard
              key={problem.id}
              problem={problem}
              acceptance={problem.acceptanceRate}
            />
          ))}
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
