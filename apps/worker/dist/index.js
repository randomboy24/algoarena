import { exec } from "child_process";
import { prisma } from "@repo/database";
import { Worker } from "bullmq";
const worker = new Worker("submission-queue", async (job) => {
    console.log("worker hit");
    if (!job.id) {
        console.log("no job");
        return;
    }
    const submissionId = job.data.submissionId;
    if (!submissionId) {
        console.log("no submission id");
        return;
    }
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
            return;
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
        }
        else {
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
        console.log("testcases length: ", testCases.length);
        console.log("language: ", language);
        const testResults = [];
        let totalExecutionTimeMs = 0;
        let maxMemoryUsedMb = 0;
        let hasFailed = false;
        // Execute each test case
        for (const tc of testCases) {
            console.log(`Running test case ${tc.id}`);
            try {
                let startTime = Date.now();
                const result = await executeCode(userCode, tc.input, language, submission.language === "PYTHON");
                const endTime = Date.now();
                const executionTimeMs = endTime - startTime;
                totalExecutionTimeMs += executionTimeMs;
                console.log("execution time (ms): ", executionTimeMs);
                console.log("actual output: ", result.output);
                console.log("expected output: ", tc.output);
                const actual = JSON.parse(result.output);
                const expected = JSON.parse(tc.output);
                const passed = JSON.stringify(actual) === JSON.stringify(expected);
                const testResult = {
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
                    console.log("Test case failed, stopping execution");
                    break;
                }
            }
            catch (error) {
                const errorMessage = formatError(error);
                console.error("Error executing test case:", errorMessage);
                const testResult = {
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
        const averageExecutionTimeMs = testResults.length > 0
            ? Math.round(totalExecutionTimeMs / testResults.length)
            : 0;
        // Update submission with results
        if (hasFailed) {
            console.log("FAILED");
            await prisma.submission.update({
                where: {
                    id: submissionId,
                },
                data: {
                    status: "FAILED",
                    testResults: testResults,
                    executionTimeMs: averageExecutionTimeMs,
                    memoryUsedMb: maxMemoryUsedMb,
                },
            });
        }
        else {
            // All tests passed
            console.log("PASSED");
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
                await updateContestScore(submission.contestId, submission.submittedBy, submission.problemId);
            }
        }
    }
    catch (err) {
        console.error("Error processing submission:", err);
        await prisma.submission.update({
            where: {
                id: submissionId,
            },
            data: {
                status: "FAILED",
            },
        });
    }
}, {
    connection: {
        host: "localhost",
        port: 6379,
        maxRetriesPerRequest: null,
    },
    concurrency: 5,
});
/**
 * Execute user code with test case input
 */
async function executeCode(userCode, input, language, isPython) {
    const startMemory = process.memoryUsage().heapUsed / 1024 / 1024;
    if (isPython) {
        return executePythonCode(userCode, input);
    }
    else {
        return executeJavaScriptCode(userCode, input);
    }
}
/**
 * Extract function name from JavaScript code
 * Supports: function name() {}, const name = (), etc.
 */
function extractFunctionNameJS(code) {
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
async function executeJavaScriptCode(userCode, input) {
    // Parse input: split by actual newlines and convert to JSON array
    const inputLines = input.split("\n").map((line) => {
        try {
            return JSON.parse(line);
        }
        catch {
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
        const child = exec(cmd, {
            timeout: 5000,
        }, (err, stdout, stderr) => {
            if (err) {
                reject(new Error(stderr || err.message));
                return;
            }
            resolve({ output: stdout.trim() });
        });
        // Send parsed input as JSON array to stdin
        child.stdin?.write(JSON.stringify(inputLines));
        child.stdin?.end();
    });
}
/**
 * Extract function name from Python code
 * Supports: def functionName():, functionName = lambda, etc.
 */
function extractFunctionNamePython(code) {
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
async function executePythonCode(userCode, input) {
    // Parse input: split by actual newlines and convert to JSON array
    const inputLines = input.split("\n").map((line) => {
        try {
            return JSON.parse(line);
        }
        catch {
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
        const child = exec(cmd, {
            timeout: 5000,
        }, (err, stdout, stderr) => {
            if (err) {
                reject(new Error(stderr || err.message));
                return;
            }
            resolve({ output: stdout.trim() });
        });
        // Send parsed input as JSON array to stdin
        child.stdin?.write(JSON.stringify(inputLines));
        child.stdin?.end();
    });
}
/**
 * Format error message for display
 */
function formatError(error) {
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
}
/**
 * Update contest participant's score after a successful submission
 */
async function updateContestScore(contestId, userId, problemId) {
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
        console.log(`Updated contest score for user ${userId}: +${contestProblem.points} points`);
    }
    catch (err) {
        console.error("Error updating contest score:", err);
    }
}
console.log("Worker started and listening for submissions...");
//# sourceMappingURL=index.js.map