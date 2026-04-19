import { prisma } from "@repo/database";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Trophy, Lock, AlertCircle } from "lucide-react";
import { ProblemPanel } from "../../../../../components/ProblemPanel";
import { ResizableLayout } from "../../../../../components/ResizableLayout";
import { ContestTimer } from "../../../components/ContestTimer";

type PageProps = {
  params: Promise<{ id: string; order: string }>;
};

function getProblemLabel(order: number): string {
  return String.fromCharCode(64 + order); // A, B, C, ... (order is 1-indexed)
}

export default async function ContestProblemPage({ params }: PageProps) {
  const { id: contestId, order: orderStr } = await params;
  const { userId } = await auth();
  const order = parseInt(orderStr, 10);

  if (isNaN(order)) {
    notFound();
  }

  // Fetch contest with the specific problem
  const contest = await prisma.contest.findUnique({
    where: { id: contestId },
    include: {
      problems: {
        where: { order },
        include: {
          problem: {
            select: {
              id: true,
              title: true,
              difficulty: true,
              description: true,
              starterCodeJavaScript: true,
              starterCodePython: true,
              examples: {
                select: {
                  input: true,
                  output: true,
                  explanation: true,
                },
              },
              constraints: {
                select: {
                  description: true,
                },
              },
              testCases: {
                select: {
                  input: true,
                  output: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!contest) {
    notFound();
  }

  const contestProblem = contest.problems[0];

  if (!contestProblem) {
    notFound();
  }

  // Update contest status if needed
  const now = new Date();
  let currentStatus = contest.status;
  if (
    contest.status === "UPCOMING" &&
    now >= contest.startTime &&
    now < contest.endTime
  ) {
    await prisma.contest.update({
      where: { id: contestId },
      data: { status: "ACTIVE" },
    });
    currentStatus = "ACTIVE";
  } else if (
    (contest.status === "UPCOMING" || contest.status === "ACTIVE") &&
    now >= contest.endTime
  ) {
    await prisma.contest.update({
      where: { id: contestId },
      data: { status: "ENDED" },
    });
    currentStatus = "ENDED";
  }

  // SECURITY: Block access to problems before contest starts
  // Check both status AND actual time to prevent any edge cases
  if (currentStatus === "UPCOMING" || now < contest.startTime) {
    return (
      <main className="min-h-screen bg-[#0A1929] flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-[#1E2A3A] flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-[#F59E0B]" />
          </div>
          <h1 className="text-2xl font-semibold text-white mb-3">
            Contest Has Not Started Yet
          </h1>
          <p className="text-[#94A3B8] mb-6">
            Problems will be available once the contest begins. Please wait for
            the contest to start.
          </p>
          <div className="mb-6">
            <ContestTimer
              startTime={contest.startTime}
              endTime={contest.endTime}
              status={currentStatus}
            />
          </div>
          <a
            href={`/contests/${contestId}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#3B82F6] text-white font-medium hover:bg-[#2563EB] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Contest
          </a>
        </div>
      </main>
    );
  }

  // Check access - must be registered for active contests
  if (currentStatus === "ACTIVE") {
    if (!userId) {
      return (
        <main className="min-h-screen bg-[#0A1929] flex items-center justify-center">
          <div className="max-w-md mx-auto px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-[#1E2A3A] flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-[#EF4444]" />
            </div>
            <h1 className="text-2xl font-semibold text-white mb-3">
              Sign In Required
            </h1>
            <p className="text-[#94A3B8] mb-6">
              You must be signed in and registered for this contest to view the
              problems.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/sign-in"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#3B82F6] text-white font-medium hover:bg-[#2563EB] transition-colors"
              >
                Sign In
              </a>
              <a
                href={`/contests/${contestId}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#1E2A3A] text-white font-medium hover:bg-[#2D3B4D] transition-colors"
              >
                Back to Contest
              </a>
            </div>
          </div>
        </main>
      );
    }

    const participant = await prisma.contestParticipant.findUnique({
      where: {
        userId_contestId: {
          userId,
          contestId,
        },
      },
    });

    if (!participant) {
      return (
        <main className="min-h-screen bg-[#0A1929] flex items-center justify-center">
          <div className="max-w-md mx-auto px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-[#1E2A3A] flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-[#F59E0B]" />
            </div>
            <h1 className="text-2xl font-semibold text-white mb-3">
              Registration Required
            </h1>
            <p className="text-[#94A3B8] mb-6">
              You must register for this contest to view and solve the problems.
            </p>
            <a
              href={`/contests/${contestId}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#3B82F6] text-white font-medium hover:bg-[#2563EB] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Register for Contest
            </a>
          </div>
        </main>
      );
    }
  }

  const problem = contestProblem.problem;

  return (
    <main className="h-screen bg-[#0A1929] flex flex-col overflow-hidden">
      {/* Contest Header Bar */}
      <div className="flex-shrink-0 border-b border-[#1E2A3A] bg-[#0B1B2D] px-4 py-2">
        <div className="flex items-center justify-between max-w-full">
          <div className="flex items-center gap-4 min-w-0">
            <a
              href={`/contests/${contestId}`}
              className="flex items-center gap-2 text-sm text-[#64748B] hover:text-white transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </a>

            <div className="h-4 w-px bg-[#1E2A3A] flex-shrink-0" />

            <div className="flex items-center gap-2 min-w-0">
              <span className="w-7 h-7 rounded-lg bg-[#1E2A3A] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                {getProblemLabel(order)}
              </span>
              <span className="text-sm font-medium text-white truncate">
                {problem.title}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-[#1E2A3A] text-[#64748B] flex-shrink-0">
                {contestProblem.points} pts
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            {currentStatus === "ENDED" ? (
              <div className="flex items-center gap-2 text-[#64748B] text-sm">
                <Trophy className="w-4 h-4" />
                <span>Contest Ended</span>
              </div>
            ) : (
              <div className="scale-90 origin-right">
                <ContestTimer
                  startTime={contest.startTime}
                  endTime={contest.endTime}
                  status={currentStatus}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Problem Content */}
      <div className="flex-1 min-h-0">
        <ResizableLayout
          leftPanel={<ProblemPanel problem={problem as any} />}
          rightPanel={problem}
          contestId={contestId}
        />
      </div>
    </main>
  );
}
