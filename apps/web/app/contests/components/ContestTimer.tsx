"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

type ContestTimerProps = {
  startTime: Date;
  endTime: Date;
  status: string;
};

function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return "00:00:00";

  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  if (days > 0) {
    return `${days}d ${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m`;
  }

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function ContestTimer({
  startTime,
  endTime,
  status,
}: ContestTimerProps) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setMounted(true);
    setNow(new Date());

    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const start = new Date(startTime);
  const end = new Date(endTime);

  // Show loading placeholder until client-side hydration is complete
  if (!mounted || !now) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[#1E2A3A] border border-[#374151]">
        <Clock className="w-5 h-5 text-[#64748B]" />
        <div>
          <p className="text-xs text-[#64748B]">Loading...</p>
          <p className="text-lg font-mono font-bold text-white">--:--:--</p>
        </div>
      </div>
    );
  }

  // Determine what to show based on status and time
  if (status === "ENDED" || now >= end) {
    return (
      <div className="flex items-center gap-2 text-[#64748B]">
        <Clock className="w-4 h-4" />
        <span className="text-sm">Contest has ended</span>
      </div>
    );
  }

  if (status === "UPCOMING" || now < start) {
    const timeUntilStart = start.getTime() - now.getTime();
    return (
      <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
        <Clock className="w-5 h-5 text-blue-400" />
        <div>
          <p className="text-xs text-blue-400">Starts in</p>
          <p className="text-lg font-mono font-bold text-white">
            {formatTimeRemaining(timeUntilStart)}
          </p>
        </div>
      </div>
    );
  }

  // Active contest
  const timeRemaining = end.getTime() - now.getTime();
  const isUrgent = timeRemaining < 5 * 60 * 1000; // Less than 5 minutes

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
        isUrgent
          ? "bg-red-500/10 border border-red-500/20"
          : "bg-green-500/10 border border-green-500/20"
      }`}
    >
      <Clock
        className={`w-5 h-5 ${isUrgent ? "text-red-400" : "text-green-400"}`}
      />
      <div>
        <p
          className={`text-xs ${isUrgent ? "text-red-400" : "text-green-400"}`}
        >
          Time remaining
        </p>
        <p className="text-lg font-mono font-bold text-white">
          {formatTimeRemaining(timeRemaining)}
        </p>
      </div>
    </div>
  );
}
