"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, RefreshCw } from "lucide-react";

type LeaderboardEntry = {
  rank: number;
  oderId: string;
  displayName: string;
  score: number;
  solvedCount: number;
  lastSolveTime: string | null;
};

type ContestLeaderboardProps = {
  contestId: string;
  currentUserId?: string | null;
  isActive: boolean;
};

function formatTime(dateStr: string | null): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

function getRankBadge(rank: number) {
  if (rank === 1) {
    return (
      <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
        <Trophy className="w-4 h-4 text-yellow-400" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-400/20 flex items-center justify-center">
        <Medal className="w-4 h-4 text-gray-300" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
        <Medal className="w-4 h-4 text-orange-400" />
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-[#1E2A3A] flex items-center justify-center text-sm font-medium text-[#94A3B8]">
      {rank}
    </div>
  );
}

export function ContestLeaderboard({
  contestId,
  currentUserId,
  isActive,
}: ContestLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`/api/v1/contests/${contestId}/leaderboard`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch leaderboard");
      }

      setLeaderboard(data.leaderboard);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();

    // Poll every 30 seconds if contest is active
    if (isActive) {
      const interval = setInterval(fetchLeaderboard, 30000);
      return () => clearInterval(interval);
    }
  }, [contestId, isActive]);

  if (loading) {
    return (
      <div className="rounded-xl border border-[#1E2A3A] bg-[#0F2235] p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 text-[#64748B] animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-[#1E2A3A] bg-[#0F2235] p-6">
        <div className="text-center py-8">
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={fetchLeaderboard}
            className="mt-4 text-sm text-[#3B82F6] hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#1E2A3A] bg-[#0F2235] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#1E2A3A] bg-[#0B1B2D] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <h2 className="text-lg font-semibold text-white">Leaderboard</h2>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-[#64748B]">
              Updated {formatTime(lastUpdated.toISOString())}
            </span>
          )}
          <button
            onClick={fetchLeaderboard}
            className="p-1.5 rounded hover:bg-[#1E2A3A] text-[#64748B] hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {leaderboard.length === 0 ? (
        <div className="px-6 py-10 text-center text-sm text-[#64748B]">
          No participants yet. Be the first to solve a problem!
        </div>
      ) : (
        <>
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-[#1E2A3A] bg-[#0B1B2D]/50 text-xs uppercase tracking-[0.2em] text-[#64748B]">
            <div className="col-span-1">Rank</div>
            <div className="col-span-5">User</div>
            <div className="col-span-2 text-right">Score</div>
            <div className="col-span-2 text-right">Solved</div>
            <div className="col-span-2 text-right">Last Solve</div>
          </div>

          {leaderboard.map((entry) => {
            const isCurrentUser = currentUserId === entry.oderId;

            return (
              <div
                key={entry.oderId}
                className={`grid grid-cols-12 gap-4 px-6 py-3 border-b border-[#1E2A3A] items-center ${
                  isCurrentUser
                    ? "bg-[#3B82F6]/10 border-l-2 border-l-[#3B82F6]"
                    : "hover:bg-[#0B1B2D]"
                }`}
              >
                <div className="col-span-1">{getRankBadge(entry.rank)}</div>
                <div className="col-span-5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium ${isCurrentUser ? "text-[#3B82F6]" : "text-white"}`}
                    >
                      {entry.displayName}
                    </span>
                    {isCurrentUser && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-[#3B82F6]/20 text-[#3B82F6]">
                        You
                      </span>
                    )}
                  </div>
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-sm font-semibold text-white">
                    {entry.score}
                  </span>
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-sm text-[#94A3B8]">
                    {entry.solvedCount}
                  </span>
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-xs text-[#64748B]">
                    {formatTime(entry.lastSolveTime)}
                  </span>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
