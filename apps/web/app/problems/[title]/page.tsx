import { notFound } from "next/navigation";
import { ProblemPanel } from "../../../components/ProblemPanel";
import { ResizableLayout } from "../../../components/ResizableLayout";
import { prisma } from "@repo/database";

// Mock data - In real app, fetch from database
// const mockProblems = {
//   "1": {
//     id: "1",
//     title: "Two Sum",
//     difficulty: "EASY",
//     description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers that add up to \`target\`.

// You may assume that each input would have exactly one solution, and you may not use the same element twice.

// You can return the answer in any order.`,
//     examples: [
//       {
//         input: "nums = [2,7,11,15], target = 9",
//         output: "[0,1]",
//         explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
//       },
//       {
//         input: "nums = [3,2,4], target = 6",
//         output: "[1,2]",
//         explanation: "Because nums[1] + nums[2] == 6, we return [1, 2].",
//       },
//       {
//         input: "nums = [3,3], target = 6",
//         output: "[0,1]",
//         explanation: "Because nums[0] + nums[1] == 6, we return [0, 1].",
//       },
//     ],
//     constraints: [
//       "2 ≤ nums.length ≤ 10⁴",
//       "-10⁹ ≤ nums[i] ≤ 10⁹",
//       "-10⁹ ≤ target ≤ 10⁹",
//       "Only one valid answer exists.",
//     ],
//     template: `function twoSum(nums, target) {
//     // Write your solution here

// };`,
//     testCases: [
//       {
//         input: "[2,7,11,15], 9",
//         output: "[0,1]",
//       },
//       {
//         input: "[3,2,4], 6",
//         output: "[1,2]",
//       },
//       {
//         input: "[3,3], 6",
//         output: "[0,1]",
//       },
//     ],
//   },
//   "2": {
//     id: "2",
//     title: "Valid Parentheses",
//     difficulty: "MEDIUM",
//     description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

// An input string is valid if:
// 1. Open brackets must be closed by the same type of brackets.as keyof typeof mockProblems];
// 2. Open brackets must be closed in the correct order.
// 3. Every close bracket has a corresponding open bracket of the same type.`,
//     examples: [
//       {
//         input: "s = '()'",
//         output: "true",
//         explanation: "The brackets are properly closed.",
//       },
//       {
//         input: "s = '()[]{}'",
//         output: "true",
//         explanation: "All brackets are properly closed in order.",
//       },
//       {
//         input: "s = '(]'",
//         output: "false",
//         explanation: "The brackets are not properly closed.",
//       },
//     ],
//     constraints: [
//       "1 ≤ s.length ≤ 10⁴",
//       "s consists of parentheses only '()[]{}'",
//     ],
//     template: `function isValid(s) {
//     // Write your solution here

// };`,
//     testCases: [
//       {
//         input: "'()'",
//         output: "true",
//       },
//       {
//         input: "'()[]{}'",
//         output: "true",
//       },
//       {
//         input: "'(]'",
//         output: "false",
//       },
//       {
//         input: "'([)]'",
//         output: "false",
//       },
//       {
//         input: "'{[]}'",
//         output: "true",
//       },
//     ],
//   },
// };

interface PageProps {
  params: Promise<{
    title: string;
  }>;
}

export default async function ProblemPage({ params }: PageProps) {
  const { title } = await params;
  console.log("title", title);
  // const problem = mockProblems[id as keyof typeof mockProblems];
  // console.log(problem)
  const problem = await prisma.problem.findUnique({
    where: {
      title: title,
    },
    select: {
      id: true,
      title: true,
      difficulty: true,
      description: true,
      examples: {
        select: {
          input: true,
          output: true,
          explanation: true,
        },
      },
      constraints: {
        select: {
          description: true,
        },
      },
      testCases: {
        select: {
          input: true,
          output: true,
        },
      },
    },
  });
  console.log(problem);

  if (!problem) {
    notFound();
  }

  return (
    <main className="h-screen bg-[#0A1929] overflow-hidden">
      <ResizableLayout
        leftPanel={<ProblemPanel problem={problem as any} />}
        rightPanel={problem}
      />
    </main>
  );
}
