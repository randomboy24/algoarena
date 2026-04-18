"use client";

import { Calendar, Users, Clock, Trophy } from "lucide-react";

type ContestCardProps = {
  contest: {
    id: string;
    title: string;
    description: string | null;
    startTime: Date;
    endTime: Date;
    status: string;
    _count: {
      problems: number;
      participants: number;
    };
  };
  isRegistered?: boolean;
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
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
    return `${hours}h ${mins}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${mins}m`;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "UPCOMING":
      return (
        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <Clock className="w-3 h-3" />
          Upcoming
        </span>
      );
    case "ACTIVE":
      return (
        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Live Now
        </span>
      );
    case "ENDED":
      return (
        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-gray-500/10 text-gray-400 border border-gray-500/20">
          <Trophy className="w-3 h-3" />
          Ended
        </span>
      );
    default:
      return null;
  }
}

export function ContestCard({ contest, isRegistered }: ContestCardProps) {
  return (
    <a
      href={`/contests/${contest.id}`}
      className="block rounded-xl border border-[#1E2A3A] bg-[#0F2235] p-6 hover:border-[#3B82F6]/50 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white group-hover:text-[#3B82F6] transition-colors truncate">
            {contest.title}
          </h3>
          {contest.description && (
            <p className="text-sm text-[#64748B] mt-1 line-clamp-2">
              {contest.description}
            </p>
          )}
        </div>
        <div className="flex-shrink-0">{getStatusBadge(contest.status)}</div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-[#94A3B8]">
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
          <span>{contest._count.participants} registered</span>
        </div>
      </div>

      {isRegistered && (
        <div className="mt-4 pt-4 border-t border-[#1E2A3A]">
          <span className="text-xs text-[#10B981] font-medium">
            You are registered
          </span>
        </div>
      )}
    </a>
  );
}
