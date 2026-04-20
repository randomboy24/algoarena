import { prisma } from "@repo/database";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Code2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";

// Simple date formatter
function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function UserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      submissions: {
        where: {
          type: "SUBMIT",
        },
        select: {
          id: true,
          createdAt: true,
          language: true,
          status: true,
          problem: {
            select: {
              id: true,
              difficulty: true,
              title: true,
              slug: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      contests: {
        select: {
          contestId: true,
          score: true,
          rank: true,
          contest: {
            select: {
              id: true,
              title: true,
              startTime: true,
              endTime: true,
              status: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return (
      <main className="min-h-screen bg-[#0A1929]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-white mb-2">
              User not found
            </h1>
            <p className="text-[#9CA3AF] mb-6">
              The user you're looking for doesn't exist.
            </p>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const solvedProblems = user.submissions.filter(
    (s) => s.status === "PASSED",
  ).length;
  const totalProblems = new Set(user.submissions.map((s) => s.problem.id)).size;
  const acceptanceRate =
    totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "PASSED":
        return "bg-emerald-500/10 text-emerald-400";
      case "FAILED":
        return "bg-rose-500/10 text-rose-400";
      case "PENDING":
        return "bg-amber-500/10 text-amber-400";
      default:
        return "bg-slate-500/10 text-slate-400";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "text-emerald-400";
      case "MEDIUM":
        return "text-amber-400";
      case "HARD":
        return "text-rose-400";
      default:
        return "text-slate-400";
    }
  };

  return (
    <main className="min-h-screen bg-[#0A1929]">
      {/* Header */}
      <div className="border-b border-[#1E2A3A] bg-[#0A1929]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 text-sm text-[#9CA3AF] hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-semibold text-white">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-1">User ID: {user.id}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Email Card */}
          <div className="bg-[#1E2A3A] border border-[#374151] rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-5 h-5 text-[#3B82F6]" />
              <span className="text-xs uppercase text-[#6B7280] font-semibold">
                Email
              </span>
            </div>
            <p className="text-white font-medium break-all">
              {user.email || "N/A"}
            </p>
          </div>

          {/* Role Card */}
          <div className="bg-[#1E2A3A] border border-[#374151] rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Code2 className="w-5 h-5 text-[#10B981]" />
              <span className="text-xs uppercase text-[#6B7280] font-semibold">
                Role
              </span>
            </div>
            <p className="text-white font-medium">
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  user.role === "ADMIN"
                    ? "bg-purple-500/20 text-purple-400"
                    : "bg-slate-500/20 text-slate-400"
                }`}
              >
                {user.role}
              </span>
            </p>
          </div>

          {/* Solved Problems Card */}
          <div className="bg-[#1E2A3A] border border-[#374151] rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-[#10B981]" />
              <span className="text-xs uppercase text-[#6B7280] font-semibold">
                Solved
              </span>
            </div>
            <p className="text-white font-medium">
              {solvedProblems} / {totalProblems}
            </p>
            <p className="text-xs text-[#6B7280] mt-1">
              {acceptanceRate}% acceptance
            </p>
          </div>

          {/* Joined Date Card */}
          <div className="bg-[#1E2A3A] border border-[#374151] rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-[#F59E0B]" />
              <span className="text-xs uppercase text-[#6B7280] font-semibold">
                Joined
              </span>
            </div>
            <p className="text-white font-medium text-sm">
              {formatDate(user.createdAt)}
            </p>
          </div>
        </div>

        {/* Submissions Section */}
        {user.submissions.length > 0 && (
          <div className="bg-[#1E2A3A] border border-[#374151] rounded-lg overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-[#374151] bg-[#0A1929]/50">
              <h2 className="text-lg font-semibold text-white">
                Recent Submissions
              </h2>
              <p className="text-sm text-[#6B7280] mt-1">
                Showing latest {Math.min(user.submissions.length, 10)}{" "}
                submissions
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#374151]">
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#9CA3AF] uppercase">
                      Problem
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#9CA3AF] uppercase">
                      Difficulty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#9CA3AF] uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#9CA3AF] uppercase">
                      Language
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#9CA3AF] uppercase">
                      Submitted
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {user.submissions.slice(0, 10).map((submission) => (
                    <tr
                      key={submission.id}
                      className="border-b border-[#374151] hover:bg-[#374151]/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/problems/${submission.problem.slug}`}
                          className="text-[#3B82F6] hover:text-[#60A5FA] font-medium"
                        >
                          {submission.problem.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-sm font-medium ${getDifficultyColor(submission.problem.difficulty)}`}
                        >
                          {submission.problem.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(submission.status)}`}
                        >
                          {submission.status === "PASSED" ? (
                            <CheckCircle className="w-3.5 h-3.5" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5" />
                          )}
                          {submission.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#6B7280]">
                          {formatDateTime(new Date(submission.createdAt))}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#6B7280]">
                          {formatDateTime(submission.createdAt)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Contests Section */}
        {user.contests.length > 0 && (
          <div className="bg-[#1E2A3A] border border-[#374151] rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-[#374151] bg-[#0A1929]/50">
              <h2 className="text-lg font-semibold text-white">
                Contest Participation
              </h2>
              <p className="text-sm text-[#6B7280] mt-1">
                {user.contests.length} contest
                {user.contests.length > 1 ? "s" : ""}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#374151]">
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#9CA3AF] uppercase">
                      Contest Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#9CA3AF] uppercase">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#9CA3AF] uppercase">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#9CA3AF] uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {user.contests.map((participation) => (
                    <tr
                      key={participation.contestId}
                      className="border-b border-[#374151] hover:bg-[#374151]/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/contests/${participation.contestId}`}
                          className="text-[#3B82F6] hover:text-[#60A5FA] font-medium"
                        >
                          {participation.contest.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white font-medium">
                          {participation.score ?? 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[#9CA3AF]">
                          {participation.rank
                            ? `#${participation.rank}`
                            : "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded ${
                            participation.contest.status === "ACTIVE"
                              ? "bg-blue-500/20 text-blue-400"
                              : participation.contest.status === "ENDED"
                                ? "bg-slate-500/20 text-slate-400"
                                : "bg-amber-500/20 text-amber-400"
                          }`}
                        >
                          {participation.contest.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {user.submissions.length === 0 && user.contests.length === 0 && (
          <div className="text-center py-16 bg-[#1E2A3A] border border-[#374151] rounded-lg">
            <Code2 className="w-12 h-12 text-[#6B7280] mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">No activity yet</h3>
            <p className="text-[#6B7280] text-sm">
              This user hasn't submitted any solutions or participated in
              contests yet.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
