"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus, CheckCircle } from "lucide-react";

type RegisterButtonProps = {
  contestId: string;
  isRegistered: boolean;
  status: string;
};

export function RegisterButton({
  contestId,
  isRegistered,
  status,
}: RegisterButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(isRegistered);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/v1/contests/${contestId}/register`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to register");
      }

      setRegistered(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (status === "ENDED") {
    return (
      <span className="inline-flex items-center gap-2 px-4 py-2 text-sm text-[#64748B]">
        Contest has ended
      </span>
    );
  }

  if (registered) {
    return (
      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
        <CheckCircle className="w-4 h-4" />
        Registered
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleRegister}
        disabled={loading}
        className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-[#3B82F6] text-sm font-medium text-white hover:bg-[#2563EB] transition-colors disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <UserPlus className="w-4 h-4" />
        )}
        Register
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
