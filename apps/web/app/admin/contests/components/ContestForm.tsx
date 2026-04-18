"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Trash2 } from "lucide-react";

type ContestFormProps = {
  mode: "create" | "edit";
  initialData?: {
    id: string;
    title: string;
    description: string | null;
    startTime: string;
    endTime: string;
    status: string;
  };
};

export function ContestForm({ mode, initialData }: ContestFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [startTime, setStartTime] = useState(
    initialData?.startTime
      ? new Date(initialData.startTime).toISOString().slice(0, 16)
      : "",
  );
  const [endTime, setEndTime] = useState(
    initialData?.endTime
      ? new Date(initialData.endTime).toISOString().slice(0, 16)
      : "",
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        title,
        description: description || undefined,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      };

      const url =
        mode === "create"
          ? "/api/v1/admin/contests"
          : `/api/v1/admin/contests/${initialData?.id}`;

      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to save contest");
      }

      if (mode === "create") {
        router.push(`/admin/contests/${data.contest.id}/edit`);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;
    if (!confirm("Are you sure you want to delete this contest?")) return;

    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/v1/admin/contests/${initialData.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete contest");
      }

      router.push("/admin/contests");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-[#94A3B8] mb-2"
          >
            Contest Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg bg-[#0B1B2D] border border-[#1E2A3A] text-white placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6] transition-colors"
            placeholder="e.g., Weekly Contest #1"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-[#94A3B8] mb-2"
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-lg bg-[#0B1B2D] border border-[#1E2A3A] text-white placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6] transition-colors resize-none"
            placeholder="Contest rules, scoring info, etc."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="startTime"
              className="block text-sm font-medium text-[#94A3B8] mb-2"
            >
              Start Time *
            </label>
            <input
              id="startTime"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-[#0B1B2D] border border-[#1E2A3A] text-white focus:outline-none focus:border-[#3B82F6] transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="endTime"
              className="block text-sm font-medium text-[#94A3B8] mb-2"
            >
              End Time *
            </label>
            <input
              id="endTime"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-[#0B1B2D] border border-[#1E2A3A] text-white focus:outline-none focus:border-[#3B82F6] transition-colors"
            />
          </div>
        </div>

        {mode === "edit" && initialData?.status && (
          <div>
            <label className="block text-sm font-medium text-[#94A3B8] mb-2">
              Current Status
            </label>
            <div className="text-sm text-white">
              {initialData.status === "UPCOMING" && (
                <span className="text-[#3B82F6]">Upcoming</span>
              )}
              {initialData.status === "ACTIVE" && (
                <span className="text-[#10B981]">Active</span>
              )}
              {initialData.status === "ENDED" && (
                <span className="text-[#94A3B8]">Ended</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[#1E2A3A]">
        <div>
          {mode === "edit" && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-colors disabled:opacity-50"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Delete Contest
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-[#3B82F6] text-sm font-medium text-white hover:bg-[#2563EB] transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {mode === "create" ? "Create Contest" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
