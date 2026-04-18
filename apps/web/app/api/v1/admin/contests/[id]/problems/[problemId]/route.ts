import { prisma } from "@repo/database";
import { NextRequest, NextResponse } from "next/server";

type UpdateProblemPayload = {
  points?: number;
  order?: number;
  makePublicAfter?: boolean;
};

// PUT - Update a contest problem (points, order, makePublicAfter)
export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string; problemId: string }> },
) => {
  try {
    const { id: contestId, problemId } = await params;
    const body = (await req.json()) as UpdateProblemPayload;

    // Find the contest problem
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
        { message: "Problem not found in this contest" },
        { status: 404 },
      );
    }

    const updateData: {
      points?: number;
      order?: number;
      makePublicAfter?: boolean;
    } = {};

    if (body.points !== undefined) {
      updateData.points = body.points;
    }

    if (body.order !== undefined) {
      updateData.order = body.order;
    }

    if (body.makePublicAfter !== undefined) {
      updateData.makePublicAfter = body.makePublicAfter;
    }

    const updated = await prisma.contestProblem.update({
      where: {
        contestId_problemId: {
          contestId,
          problemId,
        },
      },
      data: updateData,
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

    return NextResponse.json({ contestProblem: updated });
  } catch (error) {
    console.error("Error updating contest problem:", error);
    return NextResponse.json(
      { message: "INTERNAL SERVER ERROR" },
      { status: 500 },
    );
  }
};

// DELETE - Remove a problem from a contest
export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string; problemId: string }> },
) => {
  try {
    const { id: contestId, problemId } = await params;

    // Find the contest problem
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
        { message: "Problem not found in this contest" },
        { status: 404 },
      );
    }

    await prisma.contestProblem.delete({
      where: {
        contestId_problemId: {
          contestId,
          problemId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing problem from contest:", error);
    return NextResponse.json(
      { message: "INTERNAL SERVER ERROR" },
      { status: 500 },
    );
  }
};
