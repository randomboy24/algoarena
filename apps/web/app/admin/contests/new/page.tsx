import { ContestForm } from "../components/ContestForm";
import { ArrowLeft } from "lucide-react";

export default function CreateContestPage() {
  return (
    <main className="min-h-screen bg-[#0A1929]">
      <div className="border-b border-[#1E2A3A] bg-[#0A1929]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-2">
            <a
              href="/admin/contests"
              className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-white transition-colors w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Contests
            </a>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#64748B]">
                Admin contests
              </p>
              <h1 className="text-2xl font-semibold text-white">
                Create New Contest
              </h1>
              <p className="text-sm text-[#94A3B8] mt-2">
                Set up a new coding contest with timing and details.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-xl border border-[#1E2A3A] bg-[#0F2235] p-6">
          <ContestForm mode="create" />
        </div>
      </div>
    </main>
  );
}
