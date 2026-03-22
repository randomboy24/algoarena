"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type UserItem = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  role: string | null;
  createdAt: string;
};

type ApiResponse = {
  users: UserItem[];
  nextCursor: string | null;
};

const buildDisplayName = (user: UserItem) => {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return name.length ? name : "Unnamed user";
};

export const UserSearchList = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [baseUsers, setBaseUsers] = useState<UserItem[]>([]);
  const [baseNextCursor, setBaseNextCursor] = useState<string | null>(null);
  const [baseLoading, setBaseLoading] = useState(false);
  const [baseHasMore, setBaseHasMore] = useState(true);
  const [searchResults, setSearchResults] = useState<UserItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => clearTimeout(handler);
  }, [query]);

  const fetchBaseUsers = useCallback(
    async ({ reset }: { reset: boolean }) => {
      setBaseLoading(true);
      try {
        const params = new URLSearchParams();
        if (!reset && baseNextCursor) params.set("cursor", baseNextCursor);
        params.set("take", "20");

        const response = await fetch(
          `/api/v1/admin/users?${params.toString()}`,
        );
        const data = (await response.json()) as ApiResponse;

        setBaseUsers((prev) => (reset ? data.users : [...prev, ...data.users]));
        setBaseNextCursor(data.nextCursor);
        setBaseHasMore(Boolean(data.nextCursor));
      } catch (error) {
        console.error("Failed to fetch users", error);
        setBaseHasMore(false);
      } finally {
        setBaseLoading(false);
      }
    },
    [baseNextCursor],
  );

  useEffect(() => {
    setBaseUsers([]);
    setBaseNextCursor(null);
    setBaseHasMore(true);
    fetchBaseUsers({ reset: true });
  }, [fetchBaseUsers]);

  useEffect(() => {
    if (!debouncedQuery) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    const fetchSearch = async () => {
      setSearchLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("query", debouncedQuery);
        params.set("take", "20");
        const response = await fetch(
          `/api/v1/admin/users?${params.toString()}`,
        );
        const data = (await response.json()) as ApiResponse;
        setSearchResults(data.users);
      } catch (error) {
        console.error("Failed to search users", error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };

    fetchSearch();
  }, [debouncedQuery]);

  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (baseLoading || debouncedQuery) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting && baseHasMore && !baseLoading) {
          fetchBaseUsers({ reset: false });
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [baseHasMore, baseLoading, debouncedQuery, fetchBaseUsers],
  );

  const baseEmptyState = useMemo(() => {
    if (baseLoading) return "Loading users...";
    if (baseUsers.length === 0) return "No users found.";
    return null;
  }, [baseLoading, baseUsers.length]);

  const searchEmptyState = useMemo(() => {
    if (!debouncedQuery) return null;
    if (searchLoading) return "Searching...";
    if (searchResults.length === 0) return "No users match that search.";
    return null;
  }, [debouncedQuery, searchLoading, searchResults.length]);

  return (
    <div className="rounded-xl border border-[#1E2A3A] bg-[#0F2235]">
      <div className="border-b border-[#1E2A3A] px-5 py-4">
        <h2 className="text-sm font-semibold text-white">User directory</h2>
        <p className="mt-1 text-xs text-[#94A3B8]">
          Search by name or email and open a user profile.
        </p>
        <div className="mt-4">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search users by name or email"
            className="w-full rounded-lg border border-[#1E2A3A] bg-[#0B1B2D] px-4 py-2 text-sm text-white placeholder:text-[#64748B] focus:border-[#3B82F6] focus:outline-none"
          />
        </div>
      </div>

      {debouncedQuery ? (
        <div className="border-b border-[#1E2A3A] bg-[#0B1B2D]/60 px-5 py-4">
          <div className="text-xs uppercase tracking-[0.2em] text-[#64748B]">
            Search results
          </div>
          <div className="mt-3 divide-y divide-[#1E2A3A] rounded-lg border border-[#1E2A3A] overflow-hidden">
            {searchResults.map((user) => (
              <button
                key={user.id}
                onClick={() => router.push(`/admin/users/${user.id}`)}
                className="w-full text-left px-4 py-3 hover:bg-[#0B1B2D] transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium text-white">
                      {buildDisplayName(user)}
                    </div>
                    <div className="mt-1 text-xs text-[#94A3B8]">
                      {user.email}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-[#9CA3AF]">
                      {user.role ? user.role.toLowerCase() : "member"}
                    </div>
                    <div className="mt-1 text-xs text-[#64748B]">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              </button>
            ))}
            {searchEmptyState ? (
              <div className="px-4 py-4 text-center text-xs text-[#94A3B8]">
                {searchEmptyState}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="divide-y divide-[#1E2A3A]">
        {baseUsers.map((user) => (
          <button
            key={user.id}
            onClick={() => router.push(`/admin/users/${user.id}`)}
            className="w-full text-left px-5 py-4 hover:bg-[#0B1B2D] transition-colors"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-white">
                  {buildDisplayName(user)}
                </div>
                <div className="mt-1 text-xs text-[#94A3B8]">{user.email}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[#9CA3AF]">
                  {user.role ? user.role.toLowerCase() : "member"}
                </div>
                <div className="mt-1 text-xs text-[#64748B]">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>
          </button>
        ))}
        {baseEmptyState ? (
          <div className="px-5 py-6 text-center text-xs text-[#94A3B8]">
            {baseEmptyState}
          </div>
        ) : null}
      </div>

      <div className="px-5 py-4">
        {debouncedQuery ? null : baseHasMore ? (
          <div ref={sentinelRef} className="text-center text-xs text-[#64748B]">
            {baseLoading ? "Loading more users..." : "Scroll to load more"}
          </div>
        ) : (
          <div className="text-center text-xs text-[#64748B]">
            End of results
          </div>
        )}
      </div>
    </div>
  );
};
