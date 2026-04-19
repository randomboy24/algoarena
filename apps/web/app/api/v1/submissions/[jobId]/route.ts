import { prisma } from "@repo/database";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
): Promise<NextResponse> => {
  const { jobId } = await params;
  if (!jobId) {
    return NextResponse.json(
      {
        message: "BAD REQUEST",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const submission = await prisma.submission.findUnique({
      where: {
        id: jobId,
      },
      select: {
        status: true,
        testResults: true,
        executionTimeMs: true,
        memoryUsedMb: true,
        type: true,
      },
    });
    if (!submission) {
      return NextResponse.json(
        {
          message: "NOT FOUND",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      status: submission.status,
      type: submission.type,
      testResults: submission.testResults,
      executionTimeMs: submission.executionTimeMs,
      memoryUsedMb: submission.memoryUsedMb,
    });
  } catch (err) {
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
