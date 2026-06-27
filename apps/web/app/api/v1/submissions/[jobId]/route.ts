import { auth } from "@clerk/nextjs/server";
import { prisma } from "@repo/database";
import { NextRequest, NextResponse } from "next/server";

type StoredTestResult = {
  testCaseId: string;
  testCaseInput?: string;
  testCaseOutput?: string;
  actualOutput?: string;
  passed: boolean;
  errorMessage?: string;
};

function sanitizeTestResults(
  testResults: unknown,
  submissionType: "RUN" | "SUBMIT",
) {
  if (!Array.isArray(testResults)) {
    return [];
  }

  const results = testResults as StoredTestResult[];

  if (submissionType === "RUN") {
    return results;
  }

  return results.map((result, index) => ({
    testCaseId: result.testCaseId,
    testCaseNumber: index + 1,
    passed: result.passed,
    errorMessage: result.errorMessage,
    detailsHidden: true,
  }));
}

export const GET = async (
  _req: NextRequest,
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
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const submission = await prisma.submission.findUnique({
      where: {
        id: jobId,
      },
      select: {
        id: true,
        status: true,
        testResults: true,
        executionTimeMs: true,
        memoryUsedMb: true,
        type: true,
        language: true,
        submittedBy: true,
        createdAt: true,
        code: true,
        passedTestCount: true,
        totalTestCount: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
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

    if (submission.submittedBy !== userId) {
      const requester = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (requester?.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const testResults = sanitizeTestResults(
      submission.testResults,
      submission.type,
    );
    const fallbackPassedCount = testResults.filter(
      (result) => result.passed,
    ).length;
    const passedTestCount = submission.passedTestCount ?? fallbackPassedCount;
    const totalTestCount = submission.totalTestCount ?? testResults.length;

    return NextResponse.json({
      id: submission.id,
      status: submission.status,
      type: submission.type,
      testResults,
      executionTimeMs: submission.executionTimeMs,
      memoryUsedMb: submission.memoryUsedMb,
      language: submission.language,
      createdAt: submission.createdAt,
      code: submission.code,
      passedTestCount,
      totalTestCount,
      failedTestCount: Math.max(totalTestCount - passedTestCount, 0),
      user: submission.status === "PENDING" ? null : submission.user,
    });
  } catch (err) {
    console.error("Error fetching submission:", err);
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
