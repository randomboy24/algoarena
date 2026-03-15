import { prisma } from "@repo/database";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) => {
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
