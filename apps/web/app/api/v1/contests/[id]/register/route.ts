import { prisma } from "@repo/database";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// POST - Register for a contest
export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

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

    // Check if contest is still open for registration (not ended)
    if (contest.status === "ENDED") {
      return NextResponse.json(
        { message: "Contest has already ended" },
        { status: 400 },
      );
    }

    // Check if user is already registered
    const existing = await prisma.contestParticipant.findUnique({
      where: {
        userId_contestId: {
          userId,
          contestId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Already registered for this contest" },
        { status: 400 },
      );
    }

    // Register the user
    const participant = await prisma.contestParticipant.create({
      data: {
        userId,
        contestId,
      },
    });

    return NextResponse.json({ participant }, { status: 201 });
  } catch (error) {
    console.error("Error registering for contest:", error);
    return NextResponse.json(
      { message: "INTERNAL SERVER ERROR" },
      { status: 500 },
    );
  }
};
