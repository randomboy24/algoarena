import { prisma } from "@repo/database";
import { NextResponse } from "next/server";

type ConstraintInput = { id?: string; description: string };
type ExampleInput = {
  id?: string;
  input: string;
  output: string;
  explanation?: string | null;
};
type TestCaseInput = {
  id?: string;
  input: string;
  output: string;
  isSample: boolean;
};

type Payload = {
  title: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  constraints: ConstraintInput[];
  examples: ExampleInput[];
  testCases: TestCaseInput[];
  starterCodeJavaScript: string;
  starterCodePython: string;
};

export const POST = async (req: Request) => {
  try {
    const body = (await req.json()) as Payload;

    // Validate required fields
    if (!body.title || !body.description || !body.difficulty) {
      return NextResponse.json(
        { message: "Missing required fields: title, description, difficulty" },
        { status: 400 },
      );
    }

    // Check if problem with same title already exists
    const existingProblem = await prisma.problem.findUnique({
      where: { title: body.title },
    });

    if (existingProblem) {
      return NextResponse.json(
        { message: "A problem with this title already exists" },
        { status: 409 },
      );
    }

    const created = await prisma.problem.create({
      data: {
        title: body.title,
        description: body.description,
        difficulty: body.difficulty,
        isPublic: true,
        starterCodeJavaScript: body.starterCodeJavaScript,
        starterCodePython: body.starterCodePython,
        constraints: {
          create: body.constraints.map((constraint) => ({
            description: constraint.description,
          })),
        },
        examples: {
          create: body.examples.map((example) => ({
            input: example.input,
            output: example.output,
            explanation: example.explanation ?? null,
          })),
        },
        testCases: {
          create: body.testCases.map((testCase) => ({
            input: testCase.input,
            output: testCase.output,
            isSample: testCase.isSample,
          })),
        },
      },
      select: { id: true },
    });

    return NextResponse.json({ id: created.id });
  } catch (error) {
    console.error("Error creating problem:", error);
    return NextResponse.json(
      { message: "INTERNAL SERVER ERROR" },
      { status: 500 },
    );
  }
};
