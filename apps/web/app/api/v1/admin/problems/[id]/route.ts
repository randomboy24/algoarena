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

export const PUT = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const { id } = await params;
    const body = (await req.json()) as Payload;

    const constraintIds = body.constraints
      .map((item) => item.id)
      .filter(Boolean) as string[];
    const exampleIds = body.examples
      .map((item) => item.id)
      .filter(Boolean) as string[];
    const testCaseIds = body.testCases
      .map((item) => item.id)
      .filter(Boolean) as string[];

    const updated = await prisma.problem.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        difficulty: body.difficulty,
        starterCodeJavaScript: body.starterCodeJavaScript,
        starterCodePython: body.starterCodePython,
        constraints: {
          deleteMany: {
            problemId: id,
            ...(constraintIds.length ? { id: { notIn: constraintIds } } : {}),
          },
          upsert: body.constraints.map((constraint) => ({
            where: { id: constraint.id ?? "" },
            create: { description: constraint.description },
            update: { description: constraint.description },
          })),
        },
        examples: {
          deleteMany: {
            problemId: id,
            ...(exampleIds.length ? { id: { notIn: exampleIds } } : {}),
          },
          upsert: body.examples.map((example) => ({
            where: { id: example.id ?? "" },
            create: {
              input: example.input,
              output: example.output,
              explanation: example.explanation ?? null,
            },
            update: {
              input: example.input,
              output: example.output,
              explanation: example.explanation ?? null,
            },
          })),
        },
        testCases: {
          deleteMany: {
            problemId: id,
            ...(testCaseIds.length ? { id: { notIn: testCaseIds } } : {}),
          },
          upsert: body.testCases.map((testCase) => ({
            where: { id: testCase.id ?? "" },
            create: {
              input: testCase.input,
              output: testCase.output,
              isSample: testCase.isSample,
            },
            update: {
              input: testCase.input,
              output: testCase.output,
              isSample: testCase.isSample,
            },
          })),
        },
      },
      select: { id: true },
    });

    return NextResponse.json({ id: updated.id });
  } catch (error) {
    console.error("Error updating problem:", error);
    return NextResponse.json(
      { message: "INTERNAL SERVER ERROR" },
      { status: 500 },
    );
  }
};
