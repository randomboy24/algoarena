import { prisma } from "@repo/database";
import { NextRequest, NextResponse } from "next/server";

type UpdateContestPayload = {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  status?: "UPCOMING" | "ACTIVE" | "ENDED";
};

// GET - Get a single contest with its problems
export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const { id } = await params;

    const contest = await prisma.contest.findUnique({
      where: { id },
      include: {
        problems: {
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
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    if (!contest) {
      return NextResponse.json(
        { message: "Contest not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ contest });
  } catch (error) {
    console.error("Error fetching contest:", error);
    return NextResponse.json(
      { message: "INTERNAL SERVER ERROR" },
      { status: 500 },
    );
  }
};

// PUT - Update a contest
export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const { id } = await params;
    const body = (await req.json()) as UpdateContestPayload;

    // Check if contest exists
    const existing = await prisma.contest.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Contest not found" },
        { status: 404 },
      );
    }

    // Prepare update data
    const updateData: {
      title?: string;
      description?: string | null;
      startTime?: Date;
      endTime?: Date;
      status?: "UPCOMING" | "ACTIVE" | "ENDED";
    } = {};

    if (body.title !== undefined) {
      updateData.title = body.title;
    }

    if (body.description !== undefined) {
      updateData.description = body.description || null;
    }

    if (body.startTime !== undefined) {
      const startTime = new Date(body.startTime);
      if (isNaN(startTime.getTime())) {
        return NextResponse.json(
          { message: "Invalid date format for startTime" },
          { status: 400 },
        );
      }
      updateData.startTime = startTime;
    }

    if (body.endTime !== undefined) {
      const endTime = new Date(body.endTime);
      if (isNaN(endTime.getTime())) {
        return NextResponse.json(
          { message: "Invalid date format for endTime" },
          { status: 400 },
        );
      }
      updateData.endTime = endTime;
    }

    // Validate that endTime is after startTime
    const finalStartTime = updateData.startTime || existing.startTime;
    const finalEndTime = updateData.endTime || existing.endTime;
    if (finalEndTime <= finalStartTime) {
      return NextResponse.json(
        { message: "endTime must be after startTime" },
        { status: 400 },
      );
    }

    if (body.status !== undefined) {
      updateData.status = body.status;
    }

    const contest = await prisma.contest.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ contest });
  } catch (error) {
    console.error("Error updating contest:", error);
    return NextResponse.json(
      { message: "INTERNAL SERVER ERROR" },
      { status: 500 },
    );
  }
};

// DELETE - Delete a contest
export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const { id } = await params;

    // Check if contest exists
    const existing = await prisma.contest.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            participants: true,
            submissions: true,
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Contest not found" },
        { status: 404 },
      );
    }

    // Warn if contest has participants or submissions
    if (existing._count.participants > 0 || existing._count.submissions > 0) {
      // Still allow deletion but cascade delete related records
      // First delete contest problems, participants, and unlink submissions
      await prisma.$transaction([
        prisma.contestProblem.deleteMany({ where: { contestId: id } }),
        prisma.contestParticipant.deleteMany({ where: { contestId: id } }),
        prisma.submission.updateMany({
          where: { contestId: id },
          data: { contestId: null },
        }),
        prisma.contest.delete({ where: { id } }),
      ]);
    } else {
      // Simple delete for contests without participants
      await prisma.$transaction([
        prisma.contestProblem.deleteMany({ where: { contestId: id } }),
        prisma.contest.delete({ where: { id } }),
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting contest:", error);
    return NextResponse.json(
      { message: "INTERNAL SERVER ERROR" },
      { status: 500 },
    );
  }
};
