import { queue } from "@repo/queue";
import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { auth } from "@clerk/nextjs/server";

export const POST = async (req: Request) => {
  const { code, language, problemId, contestId, type } = await req.json();

  // Get authenticated user
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!code || !language || !problemId) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  try {
    // If contestId is provided, validate the contest submission
    if (contestId) {
      // Check if contest exists and is active
      const contest = await prisma.contest.findUnique({
        where: { id: contestId },
      });

      if (!contest) {
        return NextResponse.json(
          { error: "Contest not found" },
          { status: 404 },
        );
      }

      if (contest.status !== "ACTIVE") {
        return NextResponse.json(
          { error: "Contest is not active" },
          { status: 400 },
        );
      }

      // Check if user is registered for the contest
      const participant = await prisma.contestParticipant.findUnique({
        where: {
          userId_contestId: {
            userId,
            contestId,
          },
        },
      });

      if (!participant) {
        return NextResponse.json(
          { error: "Not registered for this contest" },
          { status: 403 },
        );
      }

      // Check if problem is part of the contest
      const contestProblem = await prisma.contestProblem.findUnique({
        where: {
          contestId_problemId: {
            contestId,
            problemId,
          },
        },
      });

      if (!contestProblem) {
        return NextResponse.json(
          { error: "Problem is not part of this contest" },
          { status: 400 },
        );
      }
    }

    const submission = await prisma.submission.create({
      data: {
        code: code,
        language: language,
        status: "PENDING",
        type: type || "RUN",
        problemId: problemId,
        submittedBy: userId,
        contestId: contestId || null,
      },
    });

    console.log("successful submission added to the db");

    const job = await queue.add("execute", {
      submissionId: submission.id,
    });

    console.log("submission added to the queue");

    return NextResponse.json({ submissionId: submission.id }, { status: 200 });
  } catch (err) {
    console.error("Error creating submission:", err);
    return NextResponse.json(
      {
        message: "INTERNAL SERVER ERROR",
      },
      {
        status: 500,
      },
    );
  }
};
