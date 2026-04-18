import { prisma } from "@repo/database";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ContestForm } from "../../components/ContestForm";
import { ContestProblemManager } from "../../components/ContestProblemManager";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditContestPage({ params }: PageProps) {
  const { id } = await params;

  const contest = await prisma.contest.findUnique({
    where: { id },
    include: {
      problems: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          problemId: true,
          contestId: true,
          order: true,
          points: true,
          makePublicAfter: true,
          problem: {
            select: {
              id: true,
              title: true,
              difficulty: true,
              isPublic: true,
            },
          },
        },
      },
    },
  });

  if (!contest) {
    notFound();
  }

  // Get all problems for the dropdown (including private ones)
  const allProblems = await prisma.problem.findMany({
    select: {
      id: true,
      title: true,
      difficulty: true,
      isPublic: true,
    },
    orderBy: { title: "asc" },
  });

  return (
    <main className="min-h-screen bg-[#0A1929]">
      <div className="border-b border-[#1E2A3A] bg-[#0A1929]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-2">
            <a
              href="/admin/contests"
              className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-white transition-colors w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Contests
            </a>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#64748B]">
                Admin contests
              </p>
              <h1 className="text-2xl font-semibold text-white">
                Edit Contest
              </h1>
              <p className="text-sm text-[#94A3B8] mt-2">
                Update contest details and manage problems.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Contest Details Form */}
        <div className="rounded-xl border border-[#1E2A3A] bg-[#0F2235] p-6">
          <h2 className="text-lg font-medium text-white mb-4">
            Contest Details
          </h2>
          <ContestForm
            mode="edit"
            initialData={{
              id: contest.id,
              title: contest.title,
              description: contest.description,
              startTime: contest.startTime.toISOString(),
              endTime: contest.endTime.toISOString(),
              status: contest.status,
            }}
          />
        </div>

        {/* Contest Problems */}
        <div className="rounded-xl border border-[#1E2A3A] bg-[#0F2235] p-6">
          <h2 className="text-lg font-medium text-white mb-4">
            Contest Problems
          </h2>
          <p className="text-sm text-[#64748B] mb-4">
            Add problems to this contest. Problems are labeled A, B, C, etc.
            based on their order.
          </p>
          <ContestProblemManager
            contestId={contest.id}
            contestProblems={contest.problems}
            availableProblems={allProblems}
          />
        </div>
      </div>
    </main>
  );
}
