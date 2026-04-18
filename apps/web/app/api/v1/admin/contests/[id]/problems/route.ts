import { prisma } from "@repo/database";
import { NextRequest, NextResponse } from "next/server";

type AddProblemPayload = {
  problemId: string;
  points: number;
  order: number;
  makePublicAfter?: boolean;
};

// GET - List all problems in a contest
export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const { id } = await params;

    const contest = await prisma.contest.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!contest) {
      return NextResponse.json(
        { message: "Contest not found" },
        { status: 404 },
      );
    }

    const problems = await prisma.contestProblem.findMany({
      where: { contestId: id },
      orderBy: { order: "asc" },
      include: {
        problem: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            isPublic: true,
          },
        },
      },
    });

    return NextResponse.json({ problems });
  } catch (error) {
    console.error("Error fetching contest problems:", error);
    return NextResponse.json(
      { message: "INTERNAL SERVER ERROR" },
      { status: 500 },
    );
  }
};

// POST - Add a problem to a contest
export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const { id: contestId } = await params;
    const body = (await req.json()) as AddProblemPayload;

    // Validate required fields
    if (
      !body.problemId ||
      body.points === undefined ||
      body.order === undefined
    ) {
      return NextResponse.json(
        { message: "Missing required fields: problemId, points, order" },
        { status: 400 },
      );
    }

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

    // Check if problem exists
    const problem = await prisma.problem.findUnique({
      where: { id: body.problemId },
    });

    if (!problem) {
      return NextResponse.json(
        { message: "Problem not found" },
        { status: 404 },
      );
    }

    // Check if problem is already in the contest
    const existing = await prisma.contestProblem.findUnique({
      where: {
        contestId_problemId: {
          contestId,
          problemId: body.problemId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Problem is already in this contest" },
        { status: 400 },
      );
    }

    const contestProblem = await prisma.contestProblem.create({
      data: {
        contestId,
        problemId: body.problemId,
        points: body.points,
        order: body.order,
        makePublicAfter: body.makePublicAfter || false,
      },
      include: {
        problem: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            isPublic: true,
          },
        },
      },
    });

    return NextResponse.json({ contestProblem }, { status: 201 });
  } catch (error) {
    console.error("Error adding problem to contest:", error);
    return NextResponse.json(
      { message: "INTERNAL SERVER ERROR" },
      { status: 500 },
    );
  }
};
