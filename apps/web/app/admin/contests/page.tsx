import { prisma } from "@repo/database";
import { Calendar, Users, FileText, Plus } from "lucide-react";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getStatusBadge(status: string) {
  switch (status) {
    case "UPCOMING":
      return (
        <span className="text-xs px-2 py-1 rounded-full border text-[#3B82F6] bg-[#0B1B2D] border-[#1E2A3A]">
          Upcoming
        </span>
      );
    case "ACTIVE":
      return (
        <span className="text-xs px-2 py-1 rounded-full border text-[#10B981] bg-[#0B1B2D] border-[#1E2A3A]">
          Active
        </span>
      );
    case "ENDED":
      return (
        <span className="text-xs px-2 py-1 rounded-full border text-[#94A3B8] bg-[#0B1B2D] border-[#1E2A3A]">
          Ended
        </span>
      );
    default:
      return null;
  }
}

export default async function AdminContestsPage() {
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

  return (
    <main className="min-h-screen bg-[#0A1929]">
      <div className="border-b border-[#1E2A3A] bg-[#0A1929]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#64748B]">
                Admin contests
              </p>
              <h1 className="text-2xl font-semibold text-white">
                Contest Management
              </h1>
              <p className="text-sm text-[#94A3B8] mt-2">
                Create, edit, and manage coding contests.
              </p>
            </div>
            <a
              href="/admin/contests/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3B82F6] text-sm font-medium text-white hover:bg-[#2563EB] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Contest
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-xl border border-[#1E2A3A] bg-[#0F2235] overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#1E2A3A] bg-[#0B1B2D]">
            <div className="col-span-4 text-xs uppercase tracking-[0.2em] text-[#64748B]">
              Contest
            </div>
            <div className="col-span-2 text-xs uppercase tracking-[0.2em] text-[#64748B]">
              Status
            </div>
            <div className="col-span-3 text-xs uppercase tracking-[0.2em] text-[#64748B]">
              Schedule
            </div>
            <div className="col-span-2 text-xs uppercase tracking-[0.2em] text-[#64748B]">
              Stats
            </div>
            <div className="col-span-1 text-xs uppercase tracking-[0.2em] text-[#64748B] text-right">
              Action
            </div>
          </div>

          {contests.map((contest) => (
            <a
              key={contest.id}
              href={`/admin/contests/${contest.id}/edit`}
              className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#1E2A3A] hover:bg-[#0B1B2D] transition-colors items-center"
            >
              <div className="col-span-4">
                <div className="text-sm font-medium text-white">
                  {contest.title}
                </div>
                {contest.description && (
                  <div className="text-xs text-[#64748B] mt-1 truncate max-w-[250px]">
                    {contest.description}
                  </div>
                )}
              </div>
              <div className="col-span-2">{getStatusBadge(contest.status)}</div>
              <div className="col-span-3">
                <div className="flex items-center gap-1 text-xs text-[#94A3B8]">
                  <Calendar className="w-3 h-3" />
                  {formatDate(contest.startTime)}
                </div>
                <div className="text-xs text-[#64748B] mt-1">
                  to {formatDate(contest.endTime)}
                </div>
              </div>
              <div className="col-span-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs text-[#94A3B8]">
                    <FileText className="w-3 h-3" />
                    {contest._count.problems}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#94A3B8]">
                    <Users className="w-3 h-3" />
                    {contest._count.participants}
                  </div>
                </div>
              </div>
              <div className="col-span-1 text-right text-xs text-[#3B82F6]">
                Edit
              </div>
            </a>
          ))}

          {contests.length === 0 && (
            <div className="px-6 py-10 text-center text-sm text-[#94A3B8]">
              No contests found. Create your first contest!
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
