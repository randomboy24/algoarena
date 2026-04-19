import { prisma } from "@repo/database";
import { ProblemEditor } from "../components/ProblemEditor";

export default async function Page({
  params,
}: {
  params: Promise<{ title: string }>;
}) {
  const { title } = await params;
  const problem = await prisma.problem.findUnique({
    where: { title },
    select: {
      id: true,
      title: true,
      description: true,
      difficulty: true,
      starterCodeJavaScript: true,
      starterCodePython: true,
      constraints: { select: { id: true, description: true } },
      examples: {
        select: { id: true, input: true, output: true, explanation: true },
      },
      testCases: {
        select: { id: true, input: true, output: true, isSample: true },
      },
    },
  });

  if (!problem) {
    return (
      <main className="min-h-screen bg-[#0A1929]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="rounded-xl border border-[#1E2A3A] bg-[#0F2235] p-6 text-center text-sm text-[#94A3B8]">
            Problem not found.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A1929]">
      <div className="border-b border-[#1E2A3A] bg-[#0A1929]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.3em] text-[#64748B]">
              Problem editor
            </p>
            <h1 className="text-2xl font-semibold text-white">
              {problem.title}
            </h1>
            <p className="text-sm text-[#94A3B8]">
              Update content, test cases, and metadata for this problem.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProblemEditor problem={problem} />
      </div>
    </main>
  );
}
