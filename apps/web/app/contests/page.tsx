import { prisma } from "@repo/database";
import { auth } from "@clerk/nextjs/server";
import { Trophy, Clock, CheckCircle } from "lucide-react";
import { ContestCard } from "./components/ContestCard";

export default async function ContestsPage() {
  const { userId } = await auth();

  // Update contest statuses based on current time
  const now = new Date();

  // Update contests that should be ACTIVE
  await prisma.contest.updateMany({
    where: {
      status: "UPCOMING",
      startTime: { lte: now },
      endTime: { gt: now },
    },
    data: { status: "ACTIVE" },
  });

  // Update contests that should be ENDED
  await prisma.contest.updateMany({
    where: {
      status: { in: ["UPCOMING", "ACTIVE"] },
      endTime: { lte: now },
    },
    data: { status: "ENDED" },
  });

  // Fetch all contests
  const contests = await prisma.contest.findMany({
    orderBy: { startTime: "desc" },
    include: {
      _count: {
        select: {
          problems: true,
          participants: true,
        },
      },
    },
  });

  // Get user's registrations if logged in
  let userRegistrations: Set<string> = new Set();
  if (userId) {
    const registrations = await prisma.contestParticipant.findMany({
      where: { userId },
      select: { contestId: true },
    });
    userRegistrations = new Set(registrations.map((r) => r.contestId));
  }

  // Group contests by status
  const upcomingContests = contests.filter((c) => c.status === "UPCOMING");
  const activeContests = contests.filter((c) => c.status === "ACTIVE");
  const endedContests = contests.filter((c) => c.status === "ENDED");

  return (
    <main className="min-h-screen bg-[#0A1929]">
      <div className="border-b border-[#1E2A3A] bg-[#0A1929]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.3em] text-[#64748B]">
              Compete & Learn
            </p>
            <h1 className="text-2xl font-semibold text-white">Contests</h1>
            <p className="text-sm text-[#94A3B8] mt-2">
              Participate in coding contests to test your skills and compete
              with others.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Active Contests */}
        {activeContests.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <h2 className="text-lg font-semibold text-white">Live Now</h2>
            </div>
            <div className="grid gap-4">
              {activeContests.map((contest) => (
                <ContestCard
                  key={contest.id}
                  contest={contest}
                  isRegistered={userRegistrations.has(contest.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Contests */}
        {upcomingContests.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-[#3B82F6]" />
              <h2 className="text-lg font-semibold text-white">Upcoming</h2>
            </div>
            <div className="grid gap-4">
              {upcomingContests.map((contest) => (
                <ContestCard
                  key={contest.id}
                  contest={contest}
                  isRegistered={userRegistrations.has(contest.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Ended Contests */}
        {endedContests.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-[#64748B]" />
              <h2 className="text-lg font-semibold text-white">
                Past Contests
              </h2>
            </div>
            <div className="grid gap-4">
              {endedContests.map((contest) => (
                <ContestCard
                  key={contest.id}
                  contest={contest}
                  isRegistered={userRegistrations.has(contest.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {contests.length === 0 && (
          <div className="text-center py-16">
            <Trophy className="w-12 h-12 text-[#64748B] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              No contests yet
            </h3>
            <p className="text-sm text-[#64748B]">
              Check back later for upcoming coding contests.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
