import { prisma } from "@repo/database";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  //   console.log(params);
  const { id } = await params;
  if (!id) {
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
    const problem = await prisma.problem.findFirst({
      where: {
        id: id,
      },
    });
    return NextResponse.json({
      problem,
    });
  } catch (error) {
    console.error("Error fetching problem:", error);
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
