import { prisma } from "@repo/database";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Get user basic info
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get submission stats - count unique problems solved (ACCEPTED submissions)
    const submissions = await prisma.submission.findMany({
      where: {
        submittedBy: id,
        type: "SUBMIT",
      },
      select: {
        id: true,
        problemId: true,
        status: true,
        createdAt: true,
        problem: {
          select: {
            id: true,
            title: true,
            difficulty: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate problems solved (unique accepted problems)
    const acceptedProblemIds = new Set<string>();
    const problemsByDifficulty = { EASY: 0, MEDIUM: 0, HARD: 0 };

    submissions.forEach((sub) => {
      if (sub.status === "PASSED" && !acceptedProblemIds.has(sub.problemId)) {
        acceptedProblemIds.add(sub.problemId);
        const difficulty = sub.problem
          .difficulty as keyof typeof problemsByDifficulty;
        if (difficulty in problemsByDifficulty) {
          problemsByDifficulty[difficulty]++;
        }
      }
    });

    // Get total submissions and acceptance rate
    const totalSubmissions = submissions.length;
    const acceptedSubmissions = submissions.filter(
      (s) => s.status === "PASSED",
    ).length;
    const acceptanceRate =
      totalSubmissions > 0
        ? Math.round((acceptedSubmissions / totalSubmissions) * 100)
        : 0;

    // Get recent submissions (last 10)
    const recentSubmissions = submissions.slice(0, 10).map((sub) => ({
      id: sub.id,
      problemId: sub.problemId,
      problemTitle: sub.problem.title,
      difficulty: sub.problem.difficulty,
      status: sub.status,
      createdAt: sub.createdAt,
    }));

    // Get contest participation stats
    const contestParticipations = await prisma.contestParticipant.findMany({
      where: { userId: id },
      select: {
        id: true,
        score: true,
        rank: true,
        solvedProblems: true,
        registeredAt: true,
        contest: {
          select: {
            id: true,
            title: true,
            status: true,
            startTime: true,
            endTime: true,
          },
        },
      },
      orderBy: {
        registeredAt: "desc",
      },
    });

    // Calculate contest stats
    const totalContests = contestParticipations.length;
    const completedContests = contestParticipations.filter(
      (p) => p.contest.status === "ENDED",
    );

    // Best rank (lowest rank number in completed contests)
    const rankedContests = completedContests.filter(
      (p) => p.rank !== null && p.rank > 0,
    );
    const bestRank =
      rankedContests.length > 0
        ? Math.min(...rankedContests.map((p) => p.rank!))
        : null;

    // Total contest problems solved
    const totalContestProblemsSolved = contestParticipations.reduce(
      (acc, p) => acc + p.solvedProblems.length,
      0,
    );

    // Recent contest participations (last 5)
    const recentContests = contestParticipations.slice(0, 5).map((p) => ({
      contestId: p.contest.id,
      contestTitle: p.contest.title,
      status: p.contest.status,
      score: p.score,
      rank: p.rank,
      solvedCount: p.solvedProblems.length,
      startTime: p.contest.startTime,
    }));

    // Build display name
    const displayName =
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      "Anonymous User";

    return NextResponse.json({
      user: {
        id: user.id,
        displayName,
        joinedAt: user.createdAt,
      },
      problemStats: {
        totalSolved: acceptedProblemIds.size,
        byDifficulty: problemsByDifficulty,
        totalSubmissions,
        acceptedSubmissions,
        acceptanceRate,
      },
      contestStats: {
        totalContests,
        completedContests: completedContests.length,
        bestRank,
        totalContestProblemsSolved,
      },
      recentSubmissions,
      recentContests,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user stats" },
      { status: 500 },
    );
  }
}
