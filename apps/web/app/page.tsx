import { prisma } from "@repo/database";
import { ProblemsList } from "../components/ProblemsList";

// Helper function to calculate acceptance rate
async function getAcceptanceRate(problemId: string) {
  const totalSubmissions = await prisma.submission.count({
    where: { problemId },
  });

  const acceptedSubmissions = await prisma.submission.count({
    where: {
      problemId,
      status: "PASSED", // Adjust based on your status enum
    },
  });

  if (totalSubmissions === 0) return "0%";
  return `${Math.round((acceptedSubmissions / totalSubmissions) * 100)}%`;
}

export default async function IndexPage() {
  // Only fetch public problems (exclude contest-exclusive ones)
  const problems = await prisma.problem.findMany({
    where: {
      isPublic: true,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      difficulty: true,
    },
  });

  // Get submission counts and acceptance rates for all problems
  const problemsWithStats = await Promise.all(
    problems.map(async (problem) => {
      const submissionCount = await prisma.submission.count({
        where: { problemId: problem.id },
      });

      const acceptanceRate = await getAcceptanceRate(problem.id);

      return {
        ...problem,
        submissionCount,
        acceptanceRate,
      };
    }),
  );

  return <ProblemsList problems={problemsWithStats} />;
}
