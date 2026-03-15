import { prisma } from "@repo/database";
import { NextResponse } from "next/server";
import { queue } from "@repo/queue";

export const GET = async (req: Request) => {
  try {
    const problems = await prisma.problem.findMany({
      select: {
        id: true,
        title: true,
        difficulty: true,
      },
    });
    return NextResponse.json({ problems });
  } catch (error) {
    console.error("Error fetching problems:", error);
    return NextResponse.json(
      {
        message: "INTERNAL SERVER ERROR",
      },
      { status: 500 },
    );
  }
};
