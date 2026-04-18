"use client";

import { useRouter } from "next/navigation";
import { ProblemEditor } from "../components/ProblemEditor";

const emptyProblem = {
  id: "new",
  title: "",
  description: "",
  difficulty: "EASY" as const,
  constraints: [],
  examples: [],
  testCases: [],
};

export default function CreateProblemPage() {
  const router = useRouter();

  const handleSuccess = (problemId: string) => {
    // Redirect to the newly created problem's edit page
    setTimeout(() => {
      router.push(`/admin/problems`);
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-[#0A1929]">
      <div className="border-b border-[#1E2A3A] bg-[#0A1929]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.3em] text-[#64748B]">
              Problem creation
            </p>
            <h1 className="text-2xl font-semibold text-white">
              Create New Problem
            </h1>
            <p className="text-sm text-[#94A3B8]">
              Add a new coding problem with test cases, examples, and
              constraints.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProblemEditor
          problem={emptyProblem}
          mode="create"
          onSuccess={handleSuccess}
        />
      </div>
    </main>
  );
}
