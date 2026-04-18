import { prisma } from "@repo/database";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  FileText,
  CheckCircle,
  Lock,
} from "lucide-react";
import { ContestTimer } from "../components/ContestTimer";
import { RegisterButton } from "../components/RegisterButton";
import { ContestLeaderboard } from "../components/ContestLeaderboard";

type PageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function getDuration(start: Date, end: Date): string {
  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;

  if (hours > 0 && mins > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} ${mins} minute${mins > 1 ? "s" : ""}`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  } else {
    return `${mins} minute${mins > 1 ? "s" : ""}`;
  }
}

function getProblemLabel(index: number): string {
  return String.fromCharCode(65 + index); // A, B, C, ...
}

function getDifficultyColor(difficulty: string) {
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
}

export default async function ContestDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { userId } = await auth();

  // Update contest status based on current time
  const now = new Date();

  const contest = await prisma.contest.findUnique({
    where: { id },
    include: {
      problems: {
        orderBy: { order: "asc" },
        include: {
          problem: {
            select: {
              id: true,
              title: true,
              difficulty: true,
            },
          },
        },
      },
      _count: {
        select: {
          participants: true,
        },
      },
    },
  });

  if (!contest) {
    notFound();
  }

  // Update status if needed
  let currentStatus = contest.status;
  if (
    contest.status === "UPCOMING" &&
    now >= contest.startTime &&
    now < contest.endTime
  ) {
    await prisma.contest.update({
      where: { id },
      data: { status: "ACTIVE" },
    });
    currentStatus = "ACTIVE";
  } else if (
    (contest.status === "UPCOMING" || contest.status === "ACTIVE") &&
    now >= contest.endTime
  ) {
    await prisma.contest.update({
      where: { id },
      data: { status: "ENDED" },
    });
    currentStatus = "ENDED";
  }

  // Check if user is registered
  let isRegistered = false;
  let participant = null;
  if (userId) {
    participant = await prisma.contestParticipant.findUnique({
      where: {
        userId_contestId: {
          userId,
          contestId: id,
        },
      },
    });
    isRegistered = !!participant;
  }

  // Determine if problems should be visible
  const canViewProblems =
    currentStatus === "ACTIVE" ||
    currentStatus === "ENDED" ||
    (currentStatus === "UPCOMING" && now >= contest.startTime);

  // Get user's solved problems if registered
  const solvedProblems = new Set(participant?.solvedProblems || []);

  return (
    <main className="min-h-screen bg-[#0A1929]">
      <div className="border-b border-[#1E2A3A] bg-[#0A1929]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <a
            href="/contests"
            className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Contests
          </a>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-white">
                {contest.title}
              </h1>
              {contest.description && (
                <p className="text-sm text-[#94A3B8] mt-2 max-w-2xl">
                  {contest.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-[#94A3B8]">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#64748B]" />
                  <span>{formatDate(contest.startTime)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#64748B]" />
                  <span>{getDuration(contest.startTime, contest.endTime)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#64748B]" />
                  <span>{contest._count.participants} participants</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#64748B]" />
                  <span>{contest.problems.length} problems</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3">
              <ContestTimer
                startTime={contest.startTime}
                endTime={contest.endTime}
                status={currentStatus}
              />
              {userId ? (
                <RegisterButton
                  contestId={contest.id}
                  isRegistered={isRegistered}
                  status={currentStatus}
                />
              ) : (
                <a
                  href="/sign-in"
                  className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-[#3B82F6] text-sm font-medium text-white hover:bg-[#2563EB] transition-colors"
                >
                  Sign in to register
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Problems Section */}
        <div className="rounded-xl border border-[#1E2A3A] bg-[#0F2235] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1E2A3A] bg-[#0B1B2D]">
            <h2 className="text-lg font-semibold text-white">Problems</h2>
          </div>

          {canViewProblems ? (
            <>
              <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-[#1E2A3A] bg-[#0B1B2D]/50 text-xs uppercase tracking-[0.2em] text-[#64748B]">
                <div className="col-span-1">#</div>
                <div className="col-span-6">Title</div>
                <div className="col-span-2">Difficulty</div>
                <div className="col-span-2">Points</div>
                <div className="col-span-1 text-right">Status</div>
              </div>

              {contest.problems.map((cp, index) => {
                const isSolved = solvedProblems.has(cp.problemId);
                const canAttempt = currentStatus === "ACTIVE" && isRegistered;

                return (
                  <div key={cp.id}>
                    {canAttempt || currentStatus === "ENDED" ? (
                      <a
                        href={`/contests/${contest.id}/problems/${cp.order}`}
                        className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#1E2A3A] hover:bg-[#0B1B2D] transition-colors items-center"
                      >
                        <div className="col-span-1">
                          <span className="w-8 h-8 rounded-lg bg-[#1E2A3A] flex items-center justify-center text-sm font-medium text-white">
                            {getProblemLabel(index)}
                          </span>
                        </div>
                        <div className="col-span-6">
                          <span className="text-sm font-medium text-white">
                            {cp.problem.title}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span
                            className={`text-xs font-medium ${getDifficultyColor(cp.problem.difficulty)}`}
                          >
                            {cp.problem.difficulty}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-sm text-[#94A3B8]">
                            {cp.points} pts
                          </span>
                        </div>
                        <div className="col-span-1 text-right">
                          {isSolved && (
                            <CheckCircle className="w-5 h-5 text-[#10B981] inline" />
                          )}
                        </div>
                      </a>
                    ) : (
                      <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#1E2A3A] items-center opacity-60">
                        <div className="col-span-1">
                          <span className="w-8 h-8 rounded-lg bg-[#1E2A3A] flex items-center justify-center text-sm font-medium text-white">
                            {getProblemLabel(index)}
                          </span>
                        </div>
                        <div className="col-span-6">
                          <span className="text-sm font-medium text-white">
                            {cp.problem.title}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span
                            className={`text-xs font-medium ${getDifficultyColor(cp.problem.difficulty)}`}
                          >
                            {cp.problem.difficulty}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-sm text-[#94A3B8]">
                            {cp.points} pts
                          </span>
                        </div>
                        <div className="col-span-1 text-right">
                          {!isRegistered && (
                            <Lock className="w-4 h-4 text-[#64748B] inline" />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {contest.problems.length === 0 && (
                <div className="px-6 py-10 text-center text-sm text-[#64748B]">
                  No problems added to this contest yet.
                </div>
              )}
            </>
          ) : (
            <div className="px-6 py-10 text-center">
              <Lock className="w-8 h-8 text-[#64748B] mx-auto mb-3" />
              <p className="text-sm text-[#64748B]">
                Problems will be revealed when the contest starts.
              </p>
              <p className="text-xs text-[#4B5563] mt-1">
                {contest.problems.length} problems waiting for you
              </p>
            </div>
          )}
        </div>

        {/* Registration prompt for non-registered users */}
        {!isRegistered && currentStatus !== "ENDED" && userId && (
          <div className="mt-6 p-6 rounded-xl border border-[#1E2A3A] bg-[#0F2235] text-center">
            <p className="text-sm text-[#94A3B8] mb-4">
              Register for this contest to participate and compete for the
              leaderboard.
            </p>
            <RegisterButton
              contestId={contest.id}
              isRegistered={isRegistered}
              status={currentStatus}
            />
          </div>
        )}

        {/* Leaderboard - Show for active and ended contests */}
        {(currentStatus === "ACTIVE" || currentStatus === "ENDED") && (
          <div className="mt-6">
            <ContestLeaderboard
              contestId={contest.id}
              currentUserId={userId}
              isActive={currentStatus === "ACTIVE"}
            />
          </div>
        )}
      </div>
    </main>
  );
}
