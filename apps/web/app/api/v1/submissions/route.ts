import { queue } from "@repo/queue";
import { NextResponse } from "next/server";
import { prisma } from "@repo/database";

export const POST = async (req: Request) => {
  const { code, language, problemId, submittedBy } = await req.json();

  if (!code || !language || !problemId || !submittedBy) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }
  try {
    // get the userid from the clerk auth

    const submisson = await prisma.submission.create({
      data: {
        code: code,
        language: "JAVASCRIPT",
        status: "PENDING",
        problemId: problemId,
        submittedBy: "testid",
      },
    });

    console.log("successful submission added to the db");

    const job = await queue.add("execute", {
      submissionId: submisson.id,
    });

    console.log("submission added to the queue");

    return NextResponse.json({ jobId: submisson.id }, { status: 200 });
  } catch (err) {
    NextResponse.json(
      {
        message: "INTERNAL SERVER ERROR",
      },
      {
        status: 500,
      },
    );
  }
};
