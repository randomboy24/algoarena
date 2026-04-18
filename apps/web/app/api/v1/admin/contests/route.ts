import { prisma } from "@repo/database";
import { NextResponse } from "next/server";

type CreateContestPayload = {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
};

// GET - List all contests (for admin)
export const GET = async () => {
  try {
    const contests = await prisma.contest.findMany({
      orderBy: { startTime: "desc" },
      include: {
        _count: {
          select: {
            problems: true,
            participants: true,
          },
        },
      },
    });

    return NextResponse.json({ contests });
  } catch (error) {
    console.error("Error fetching contests:", error);
    return NextResponse.json(
      { message: "INTERNAL SERVER ERROR" },
      { status: 500 },
    );
  }
};

// POST - Create a new contest
export const POST = async (req: Request) => {
  try {
    const body = (await req.json()) as CreateContestPayload;

    // Validate required fields
    if (!body.title || !body.startTime || !body.endTime) {
      return NextResponse.json(
        { message: "Missing required fields: title, startTime, endTime" },
        { status: 400 },
      );
    }

    const startTime = new Date(body.startTime);
    const endTime = new Date(body.endTime);

    // Validate dates
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return NextResponse.json(
        { message: "Invalid date format for startTime or endTime" },
        { status: 400 },
      );
    }

    if (endTime <= startTime) {
      return NextResponse.json(
        { message: "endTime must be after startTime" },
        { status: 400 },
      );
    }

    // Determine initial status based on current time
    const now = new Date();
    let status: "UPCOMING" | "ACTIVE" | "ENDED" = "UPCOMING";
    if (now >= startTime && now < endTime) {
      status = "ACTIVE";
    } else if (now >= endTime) {
      status = "ENDED";
    }

    const contest = await prisma.contest.create({
      data: {
        title: body.title,
        description: body.description || null,
        startTime,
        endTime,
        status,
      },
    });

    return NextResponse.json({ contest }, { status: 201 });
  } catch (error) {
    console.error("Error creating contest:", error);
    return NextResponse.json(
      { message: "INTERNAL SERVER ERROR" },
      { status: 500 },
    );
  }
};
