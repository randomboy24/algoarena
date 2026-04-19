import { exec } from "child_process";
import { prisma } from "@repo/database";
import { Worker } from "bullmq";

interface TestResult {
  testCaseId: string;
  testCaseInput: string;
  testCaseOutput: string;
  actualOutput: string;
  passed: boolean;
  errorMessage?: string;
}

const worker = new Worker(
  "submission-queue",
  async (job) => {
    console.log(`[Worker] Processing job ${job.id}`);

    // Validate job data
    if (!job || !job.id) {
      console.error("[Worker] Invalid job object");
      throw new Error("Job object is invalid");
    }

    if (!job.data || typeof job.data !== "object") {
      console.error(`[Worker] Job ${job.id} has invalid data:`, job.data);
      throw new Error("Job data is missing or invalid");
    }

    const submissionId = job.data.submissionId;
    if (!submissionId) {
      console.error(`[Worker] Job ${job.id} has no submissionId`);
      throw new Error("submissionId is required in job data");
    }

    console.log(
      `[Worker] Job ${job.id} - Processing submission: ${submissionId}`,
    );

    try {
      const submission = await prisma.submission.findUnique({
        where: {
          id: submissionId,
        },
        select: {
          code: true,
          status: true,
          language: true,
          problemId: true,
          type: true,
          contestId: true,
          submittedBy: true,
        },
      });
      if (!submission) {
        const errorMsg = `Submission ${submissionId} not found`;
        console.error(`[Worker] ${errorMsg}`);
        throw new Error(errorMsg);
      }

      // Fetch test cases based on submission type
      let testCases;
      if (submission.type == "RUN") {
        testCases = await prisma.testCase.findMany({
          where: {
            problemId: submission.problemId,
            isSample: true,
          },
          select: {
            id: true,
            input: true,
            output: true,
          },
        });
      } else {
        testCases = await prisma.testCase.findMany({
          where: {
            problemId: submission.problemId,
          },
          select: {
            id: true,
            input: true,
            output: true,
          },
        });
      }

      const userCode = submission.code;
      const language = submission.language;

      console.log(
        `[Worker] Submission ${submissionId}: language=${language}, testCases=${testCases.length}`,
      );

      const testResults: TestResult[] = [];
      let totalExecutionTimeMs = 0;
      let maxMemoryUsedMb = 0;
      let hasFailed = false;

      // Execute each test case
      for (const tc of testCases) {
        console.log(`[Worker] Running test case ${tc.id}`);

        try {
          let startTime = Date.now();
          const result = await executeCode(
            userCode,
            tc.input,
            language,
            submission.language === "PYTHON",
          );
          const endTime = Date.now();

          const executionTimeMs = endTime - startTime;
          totalExecutionTimeMs += executionTimeMs;

          console.log(
            `[Worker] Test ${tc.id}: ${executionTimeMs}ms - actual: ${result.output.substring(0, 50)}... expected: ${tc.output.substring(0, 50)}...`,
          );

          const actual = JSON.parse(result.output);
          const expected = JSON.parse(tc.output);

          const passed = JSON.stringify(actual) === JSON.stringify(expected);

          const testResult: TestResult = {
            testCaseId: tc.id,
            testCaseInput: tc.input,
            testCaseOutput: tc.output,
            actualOutput: result.output,
            passed,
          };

          if (!passed) {
            hasFailed = true;
          }

          testResults.push(testResult);

          // Stop on first failure
          if (hasFailed) {
            console.log(
              `[Worker] ❌ Test case ${tc.id} failed, stopping execution`,
            );
            break;
          }
        } catch (error) {
          const errorMessage = formatError(error);
          console.error("Error executing test case:", errorMessage);

          const testResult: TestResult = {
            testCaseId: tc.id,
            testCaseInput: tc.input,
            testCaseOutput: tc.output,
            actualOutput: "",
            passed: false,
            errorMessage,
          };

          testResults.push(testResult);
          hasFailed = true;
          break;
        }
      }

      // Calculate average execution time
      const averageExecutionTimeMs =
        testResults.length > 0
          ? Math.round(totalExecutionTimeMs / testResults.length)
          : 0;

      // Update submission with results
      if (hasFailed) {
        console.log(
          `[Worker] ❌ Submission ${submissionId} FAILED: ${testResults.filter((r) => !r.passed).length}/${testResults.length} tests failed`,
        );
        await prisma.submission.update({
          where: {
            id: submissionId,
          },
          data: {
            status: "FAILED",
            testResults: testResults as any,
            executionTimeMs: averageExecutionTimeMs,
            memoryUsedMb: maxMemoryUsedMb,
          },
        });
      } else {
        // All tests passed
        console.log(
          `[Worker] ✅ Submission ${submissionId} PASSED: All ${testResults.length} tests passed in ${averageExecutionTimeMs}ms`,
        );
        await prisma.submission.update({
          where: {
            id: submissionId,
          },
          data: {
            status: "PASSED",
            executionTimeMs: averageExecutionTimeMs,
            memoryUsedMb: maxMemoryUsedMb,
          },
        });

        // If this is a contest submission, update the participant's score
        if (submission.contestId && submission.submittedBy) {
          await updateContestScore(
            submission.contestId,
            submission.submittedBy,
            submission.problemId,
          );
        }
      }
    } catch (err) {
      const errorMessage = formatError(err);
      console.error(
        `[Worker] ❌ Error processing submission ${submissionId}:`,
        errorMessage,
      );

      try {
        await prisma.submission.update({
          where: {
            id: submissionId,
          },
          data: {
            status: "FAILED",
          },
        });
        console.log(
          `[Worker] Updated submission ${submissionId} status to FAILED`,
        );
      } catch (dbErr) {
        console.error(
          `[Worker] Failed to update submission status:`,
          formatError(dbErr),
        );
      }

      // Re-throw the error so BullMQ can handle it properly
      throw err;
    }
  },
  {
    connection: {
      host: "localhost",
      port: 6379,
      maxRetriesPerRequest: null,
    },
    concurrency: 5,
  },
);

/**
 * Execute user code with test case input
 */
async function executeCode(
  userCode: string,
  input: string,
  language: string,
  isPython: boolean,
): Promise<{ output: string }> {
  const startMemory = process.memoryUsage().heapUsed / 1024 / 1024;

  if (isPython) {
    return executePythonCode(userCode, input);
  } else {
    return executeJavaScriptCode(userCode, input);
  }
}

/**
 * Extract function name from JavaScript code
 * Supports: function name() {}, const name = (), etc.
 */
function extractFunctionNameJS(code: string): string {
  // Try to match: function functionName or const/let/var functionName =
  const patterns = [
    /function\s+(\w+)\s*\(/, // function twoSum() {}
    /const\s+(\w+)\s*=\s*\(/, // const twoSum = () => {}
    /let\s+(\w+)\s*=\s*\(/, // let twoSum = () => {}
    /var\s+(\w+)\s*=\s*\(/, // var twoSum = () => {}
    /export\s+function\s+(\w+)/, // export function twoSum() {}
    /exports\.(\w+)\s*=\s*function/, // exports.twoSum = function() {}
  ];

  for (const pattern of patterns) {
    const match = code.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // Default fallback
  return "solve";
}

/**
 * Execute JavaScript code
 */
async function executeJavaScriptCode(
  userCode: string,
  input: string,
): Promise<{ output: string }> {
  // Parse input: split by actual newlines and convert to JSON array
  const inputLines = input.split("\n").map((line) => {
    try {
      return JSON.parse(line);
    } catch {
      return line; // If not JSON, return as string
    }
  });

  // Extract the actual function name from user code
  const functionName = extractFunctionNameJS(userCode);

  const wrapped = `${userCode}
const fs = require("fs");
const args = JSON.parse(fs.readFileSync("/dev/stdin", "utf8"));
const result = ${functionName}(...args);
console.log(JSON.stringify(result));
`;

  return new Promise((resolve, reject) => {
    const cmd = `docker run --rm -i --memory="128m" --cpus="0.5" node:18 node -e '${wrapped.replace(/'/g, "'\\''")}'`;

    const child = exec(
      cmd,
      {
        timeout: 5000,
      },
      (err, stdout, stderr) => {
        if (err) {
          reject(new Error(stderr || err.message));
          return;
        }
        resolve({ output: stdout.trim() });
      },
    );

    // Send parsed input as JSON array to stdin
    child.stdin?.write(JSON.stringify(inputLines));
    child.stdin?.end();
  });
}

/**
 * Extract function name from Python code
 * Supports: def functionName():, functionName = lambda, etc.
 */
function extractFunctionNamePython(code: string): string {
  // Try to match: def functionName or functionName = lambda
  const patterns = [
    /def\s+(\w+)\s*\(/, // def twoSum():
    /(\w+)\s*=\s*lambda/, // twoSum = lambda
  ];

  for (const pattern of patterns) {
    const match = code.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // Default fallback
  return "solve";
}

/**
 * Execute Python code
 */
async function executePythonCode(
  userCode: string,
  input: string,
): Promise<{ output: string }> {
  // Parse input: split by actual newlines and convert to JSON array
  const inputLines = input.split("\n").map((line) => {
    try {
      return JSON.parse(line);
    } catch {
      return line; // If not JSON, return as string
    }
  });

  // Extract the actual function name from user code
  const functionName = extractFunctionNamePython(userCode);

  const wrapped = `${userCode}
import sys
import json

args = json.loads(input())
result = ${functionName}(*args)
print(json.dumps(result))
`;

  return new Promise((resolve, reject) => {
    const cmd = `docker run --rm -i --memory="128m" --cpus="0.5" python:3.11 python -c '${wrapped.replace(/'/g, "'\\''")}'`;

    const child = exec(
      cmd,
      {
        timeout: 5000,
      },
      (err, stdout, stderr) => {
        if (err) {
          reject(new Error(stderr || err.message));
          return;
        }
        resolve({ output: stdout.trim() });
      },
    );

    // Send parsed input as JSON array to stdin
    child.stdin?.write(JSON.stringify(inputLines));
    child.stdin?.end();
  });
}

/**
 * Format error message for display
 */
function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * Update contest participant's score after a successful submission
 */
async function updateContestScore(
  contestId: string,
  userId: string,
  problemId: string,
) {
  try {
    // Get the contest participant
    const participant = await prisma.contestParticipant.findUnique({
      where: {
        userId_contestId: {
          userId,
          contestId,
        },
      },
    });

    if (!participant) {
      console.log("Participant not found for contest score update");
      return;
    }

    // Check if this problem was already solved
    if (participant.solvedProblems.includes(problemId)) {
      console.log("Problem already solved, skipping score update");
      return;
    }

    // Get the contest problem to find the points
    const contestProblem = await prisma.contestProblem.findUnique({
      where: {
        contestId_problemId: {
          contestId,
          problemId,
        },
      },
    });

    if (!contestProblem) {
      console.log("Contest problem not found");
      return;
    }

    // Update the participant's score and solved problems
    await prisma.contestParticipant.update({
      where: {
        userId_contestId: {
          userId,
          contestId,
        },
      },
      data: {
        score: participant.score + contestProblem.points,
        solvedProblems: [...participant.solvedProblems, problemId],
        lastSolveTime: new Date(),
      },
    });

    console.log(
      `Updated contest score for user ${userId}: +${contestProblem.points} points`,
    );
  } catch (err) {
    console.error("Error updating contest score:", err);
  }
}

console.log("Worker started and listening for submissions...");

// Worker event handlers for debugging and monitoring
worker.on("ready", () => {
  console.log("[Worker] ✅ Worker is ready and connected to Redis");
});

worker.on("active", (job) => {
  console.log(
    `[Worker] 🔄 Job ${job.id} is now active (submissionId: ${job.data.submissionId})`,
  );
});

worker.on("completed", (job, result) => {
  console.log(`[Worker] ✅ Job ${job.id} completed successfully`);
});

worker.on("failed", (job, error) => {
  console.error(`[Worker] ❌ Job ${job?.id} failed with error:`, error.message);
  if (job?.data?.submissionId) {
    console.error(`[Worker] Failed submission ID: ${job.data.submissionId}`);
  }
});

worker.on("error", (error) => {
  console.error("[Worker] ❌ Worker error:", error);
});

worker.on("close", () => {
  console.warn("[Worker] ⚠️  Worker connection closed");
});

worker.on("pause", () => {
  console.warn("[Worker] ⚠️  Worker paused");
});

worker.on("resume", () => {
  console.log("[Worker] ✅ Worker resumed");
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("[Worker] Received SIGTERM, closing gracefully...");
  await worker.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("[Worker] Received SIGINT, closing gracefully...");
  await worker.close();
  process.exit(0);
});
