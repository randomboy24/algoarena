import { prisma } from "@repo/database";

export default async function Page() {
  const problems = await prisma.problem.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      difficulty: true,
    },
  });
  return (
    <main className="min-h-screen bg-[#0A1929]">
      <div className="border-b border-[#1E2A3A] bg-[#0A1929]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#64748B]">
                Admin problems
              </p>
              <h1 className="text-2xl font-semibold text-white">
                Problem list
              </h1>
              <p className="text-sm text-[#94A3B8] mt-2">
                Review, edit, and manage all published problems.
              </p>
            </div>
            <a
              href="/admin/problems/create-new"
              className="px-4 py-2 rounded-lg bg-[#3B82F6] text-sm font-medium text-white hover:bg-[#2563EB] transition-colors"
            >
              Create new problem
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-xl border border-[#1E2A3A] bg-[#0F2235] overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#1E2A3A] bg-[#0B1B2D]">
            <div className="col-span-7 text-xs uppercase tracking-[0.2em] text-[#64748B]">
              Title
            </div>
            <div className="col-span-3 text-xs uppercase tracking-[0.2em] text-[#64748B]">
              Difficulty
            </div>
            <div className="col-span-2 text-xs uppercase tracking-[0.2em] text-[#64748B] text-right">
              Action
            </div>
          </div>

          {problems.map((problem) => (
            <a
              key={problem.id}
              href={`/admin/problems/${problem.slug}`}
              className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#1E2A3A] hover:bg-[#0B1B2D] transition-colors"
            >
              <div className="col-span-7">
                <div className="text-sm font-medium text-white">
                  {problem.title}
                </div>
              </div>
              <div className="col-span-3">
                <span
                  className={`text-xs px-2 py-1 rounded-full border inline-flex items-center justify-center ${
                    problem.difficulty === "EASY"
                      ? "text-[#10B981] bg-[#0B1B2D] border-[#1E2A3A]"
                      : problem.difficulty === "MEDIUM"
                        ? "text-[#F59E0B] bg-[#0B1B2D] border-[#1E2A3A]"
                        : "text-[#EF4444] bg-[#0B1B2D] border-[#1E2A3A]"
                  }`}
                >
                  {problem.difficulty}
                </span>
              </div>
              <div className="col-span-2 text-right text-xs text-[#3B82F6]">
                Open
              </div>
            </a>
          ))}

          {problems.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-[#94A3B8]">
              No problems found.
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
