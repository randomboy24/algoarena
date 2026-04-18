import { UserSearchList } from "./components/UserSearchList";

export default function AdminDashboard() {
  return (
    <main className="min-h-screen bg-[#0A1929]">
      <div className="border-b border-[#1E2A3A] bg-[#0A1929]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#64748B]">
                Admin control center
              </p>
              <h1 className="text-2xl font-semibold text-white">
                Dashboard overview
              </h1>
              <p className="text-sm text-[#94A3B8] mt-2">
                Manage users and problems from one place.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/admin/contests"
                className="px-4 py-2 rounded-lg border border-[#1E2A3A] text-sm text-[#9CA3AF] hover:text-white hover:border-[#3B82F6] transition-colors"
              >
                Contests
              </a>
              <a
                href="/admin/problems"
                className="px-4 py-2 rounded-lg border border-[#1E2A3A] text-sm text-[#9CA3AF] hover:text-white hover:border-[#3B82F6] transition-colors"
              >
                Problems
              </a>
              <a
                href="/admin/problems/create-new"
                className="px-4 py-2 rounded-lg bg-[#3B82F6] text-sm font-medium text-white hover:bg-[#2563EB] transition-colors"
              >
                Create new problem
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UserSearchList />
      </div>
    </main>
  );
}
