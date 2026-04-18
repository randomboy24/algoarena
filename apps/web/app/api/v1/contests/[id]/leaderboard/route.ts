import { prisma } from "@repo/database";
import { NextRequest, NextResponse } from "next/server";

// GET - Get contest leaderboard
export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const { id: contestId } = await params;

    // Check if contest exists
    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
    });

    if (!contest) {
      return NextResponse.json(
        { message: "Contest not found" },
        { status: 404 },
      );
    }

    // Get all participants with their scores, sorted by score (desc) and lastSolveTime (asc)
    const participants = await prisma.contestParticipant.findMany({
      where: { contestId },
      orderBy: [{ score: "desc" }, { lastSolveTime: "asc" }],
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Calculate ranks (handle ties)
    let currentRank = 1;
    const leaderboard = participants.map((participant, index) => {
      // If this participant has different score than previous, update rank
      if (index > 0) {
        const prev = participants[index - 1];
        if (
          participant.score !== prev.score ||
          participant.lastSolveTime?.getTime() !== prev.lastSolveTime?.getTime()
        ) {
          currentRank = index + 1;
        }
      }

      // Determine display name
      let displayName = "Anonymous";
      if (participant.user.firstName || participant.user.lastName) {
        displayName = [participant.user.firstName, participant.user.lastName]
          .filter(Boolean)
          .join(" ");
      } else if (participant.user.email) {
        displayName = participant.user.email.split("@")[0];
      }

      return {
        rank: currentRank,
        oderId: participant.userId,
        displayName,
        score: participant.score,
        solvedCount: participant.solvedProblems.length,
        lastSolveTime: participant.lastSolveTime,
      };
    });

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { message: "INTERNAL SERVER ERROR" },
      { status: 500 },
    );
  }
};
