"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  ArrowLeft,
  Trophy,
  Target,
  Calendar,
  Code,
  Award,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

type UserStats = {
  user: {
    id: string;
    displayName: string;
    joinedAt: string;
  };
  problemStats: {
    totalSolved: number;
    byDifficulty: {
      EASY: number;
      MEDIUM: number;
      HARD: number;
    };
    totalSubmissions: number;
    acceptedSubmissions: number;
    acceptanceRate: number;
  };
  contestStats: {
    totalContests: number;
    completedContests: number;
    bestRank: number | null;
    totalContestProblemsSolved: number;
  };
  recentSubmissions: Array<{
    id: string;
    problemId: string;
    problemTitle: string;
    difficulty: string;
    status: string;
    createdAt: string;
  }>;
  recentContests: Array<{
    contestId: string;
    contestTitle: string;
    status: string;
    score: number;
    rank: number | null;
    solvedCount: number;
    startTime: string;
  }>;
};

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

function getDifficultyBgColor(difficulty: string) {
  switch (difficulty) {
    case "EASY":
      return "bg-[#10B981]/10 border-[#10B981]/20";
    case "MEDIUM":
      return "bg-[#F59E0B]/10 border-[#F59E0B]/20";
    case "HARD":
      return "bg-[#EF4444]/10 border-[#EF4444]/20";
    default:
      return "bg-[#94A3B8]/10 border-[#94A3B8]/20";
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "PASSED":
      return "text-[#10B981]";
    case "FAILED":
      return "text-[#EF4444]";
    case "PENDING":
      return "text-[#F59E0B]";
    default:
      return "text-[#94A3B8]";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "PASSED":
      return "Accepted";
    case "FAILED":
      return "Failed";
    case "PENDING":
      return "Pending";
    default:
      return status;
  }
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export default function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const { user } = useUser();

  useEffect(() => {
    params.then(({ id }) => setUserId(id));
  }, [params]);

  useEffect(() => {
    if (!userId) return;

    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/v1/users/${userId}/stats`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("User not found");
          } else {
            setError("Failed to load profile");
          }
          return;
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  const isOwnProfile = user?.id === userId;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0A1929] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#3B82F6]"></div>
      </main>
    );
  }

  if (error || !stats) {
    return (
      <main className="min-h-screen bg-[#0A1929] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#EF4444] mb-4">
            {error || "Something went wrong"}
          </p>
          <a
            href="/"
            className="text-[#3B82F6] hover:text-[#60A5FA] transition-colors"
          >
            Go home
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A1929]">
      {/* Header */}
      <div className="border-b border-[#1E2A3A] bg-[#0A1929]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </a>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center text-3xl font-bold text-white">
              {stats.user.displayName.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-white">
                {stats.user.displayName}
                {isOwnProfile && (
                  <span className="ml-2 text-xs px-2 py-1 rounded bg-[#3B82F6]/20 text-[#3B82F6]">
                    You
                  </span>
                )}
              </h1>
              <div className="flex items-center gap-1.5 mt-1 text-sm text-[#64748B]">
                <Calendar className="w-4 h-4" />
                <span>Joined {formatDate(stats.user.joinedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl border border-[#1E2A3A] bg-[#0F2235]">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-[#10B981]" />
              <span className="text-xs text-[#64748B] uppercase tracking-wider">
                Problems Solved
              </span>
            </div>
            <p className="text-2xl font-bold text-white">
              {stats.problemStats.totalSolved}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[#1E2A3A] bg-[#0F2235]">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-[#3B82F6]" />
              <span className="text-xs text-[#64748B] uppercase tracking-wider">
                Acceptance Rate
              </span>
            </div>
            <p className="text-2xl font-bold text-white">
              {stats.problemStats.acceptanceRate}%
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[#1E2A3A] bg-[#0F2235]">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-[#F59E0B]" />
              <span className="text-xs text-[#64748B] uppercase tracking-wider">
                Contests
              </span>
            </div>
            <p className="text-2xl font-bold text-white">
              {stats.contestStats.totalContests}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[#1E2A3A] bg-[#0F2235]">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-[#8B5CF6]" />
              <span className="text-xs text-[#64748B] uppercase tracking-wider">
                Best Rank
              </span>
            </div>
            <p className="text-2xl font-bold text-white">
              {stats.contestStats.bestRank
                ? `#${stats.contestStats.bestRank}`
                : "-"}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Problems Section */}
          <div className="rounded-xl border border-[#1E2A3A] bg-[#0F2235] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#1E2A3A] bg-[#0B1B2D]">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Code className="w-5 h-5 text-[#3B82F6]" />
                  Problems
                </h2>
                <span className="text-sm text-[#64748B]">
                  {stats.problemStats.totalSubmissions} submissions
                </span>
              </div>
            </div>

            {/* Difficulty Breakdown */}
            <div className="p-6 border-b border-[#1E2A3A]">
              <div className="flex gap-4">
                <div
                  className={`flex-1 p-3 rounded-lg border ${getDifficultyBgColor("EASY")}`}
                >
                  <p className="text-xs text-[#64748B] mb-1">Easy</p>
                  <p
                    className={`text-xl font-bold ${getDifficultyColor("EASY")}`}
                  >
                    {stats.problemStats.byDifficulty.EASY}
                  </p>
                </div>
                <div
                  className={`flex-1 p-3 rounded-lg border ${getDifficultyBgColor("MEDIUM")}`}
                >
                  <p className="text-xs text-[#64748B] mb-1">Medium</p>
                  <p
                    className={`text-xl font-bold ${getDifficultyColor("MEDIUM")}`}
                  >
                    {stats.problemStats.byDifficulty.MEDIUM}
                  </p>
                </div>
                <div
                  className={`flex-1 p-3 rounded-lg border ${getDifficultyBgColor("HARD")}`}
                >
                  <p className="text-xs text-[#64748B] mb-1">Hard</p>
                  <p
                    className={`text-xl font-bold ${getDifficultyColor("HARD")}`}
                  >
                    {stats.problemStats.byDifficulty.HARD}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Submissions */}
            <div className="px-6 py-3 border-b border-[#1E2A3A] bg-[#0B1B2D]/50">
              <h3 className="text-sm font-medium text-[#94A3B8]">
                Recent Submissions
              </h3>
            </div>

            {stats.recentSubmissions.length > 0 ? (
              <div className="divide-y divide-[#1E2A3A]">
                {stats.recentSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="px-6 py-3 flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <a
                        href={`/problems/${sub.problemId}`}
                        className="text-sm text-white hover:text-[#3B82F6] transition-colors truncate block"
                      >
                        {sub.problemTitle}
                      </a>
                      <span
                        className={`text-xs ${getDifficultyColor(sub.difficulty)}`}
                      >
                        {sub.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {sub.status === "PASSED" ? (
                        <CheckCircle className="w-4 h-4 text-[#10B981]" />
                      ) : (
                        <XCircle
                          className={`w-4 h-4 ${getStatusColor(sub.status)}`}
                        />
                      )}
                      <span className={`text-xs ${getStatusColor(sub.status)}`}>
                        {getStatusLabel(sub.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-8 text-center text-sm text-[#64748B]">
                No submissions yet
              </div>
            )}
          </div>

          {/* Contests Section */}
          <div className="rounded-xl border border-[#1E2A3A] bg-[#0F2235] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#1E2A3A] bg-[#0B1B2D]">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#F59E0B]" />
                  Contests
                </h2>
                <span className="text-sm text-[#64748B]">
                  {stats.contestStats.completedContests} completed
                </span>
              </div>
            </div>

            {/* Contest Stats */}
            <div className="p-6 border-b border-[#1E2A3A]">
              <div className="flex gap-4">
                <div className="flex-1 p-3 rounded-lg border border-[#1E2A3A] bg-[#0B1B2D]">
                  <p className="text-xs text-[#64748B] mb-1">Problems Solved</p>
                  <p className="text-xl font-bold text-white">
                    {stats.contestStats.totalContestProblemsSolved}
                  </p>
                </div>
                <div className="flex-1 p-3 rounded-lg border border-[#1E2A3A] bg-[#0B1B2D]">
                  <p className="text-xs text-[#64748B] mb-1">Participated</p>
                  <p className="text-xl font-bold text-white">
                    {stats.contestStats.totalContests}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Contests */}
            <div className="px-6 py-3 border-b border-[#1E2A3A] bg-[#0B1B2D]/50">
              <h3 className="text-sm font-medium text-[#94A3B8]">
                Recent Contests
              </h3>
            </div>

            {stats.recentContests.length > 0 ? (
              <div className="divide-y divide-[#1E2A3A]">
                {stats.recentContests.map((contest) => (
                  <a
                    key={contest.contestId}
                    href={`/contests/${contest.contestId}`}
                    className="px-6 py-3 flex items-center justify-between hover:bg-[#0B1B2D] transition-colors block"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">
                        {contest.contestTitle}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-[#64748B]" />
                        <span className="text-xs text-[#64748B]">
                          {formatDate(contest.startTime)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      {contest.rank && (
                        <p className="text-sm font-medium text-white">
                          #{contest.rank}
                        </p>
                      )}
                      <p className="text-xs text-[#64748B]">
                        {contest.score} pts · {contest.solvedCount} solved
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="px-6 py-8 text-center text-sm text-[#64748B]">
                No contest participation yet
              </div>
            )}

            {stats.recentContests.length > 0 && (
              <div className="px-6 py-3 border-t border-[#1E2A3A]">
                <a
                  href="/contests"
                  className="text-sm text-[#3B82F6] hover:text-[#60A5FA] transition-colors"
                >
                  View all contests
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
