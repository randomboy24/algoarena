import { exec } from "child_process";
import { prisma } from "@repo/database";
import { Worker } from "bullmq";
const testCases = [
    { input: [3, 5], expected: 8 },
    { input: [10, 2], expected: 12 },
];
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
        // user code example --> function sum(n,m) { return n + m }
        // test case example --> input: "4, 3", output: "7"
        // we have to run the user code with the test case input and check if the output is same as the test case output
        // simulate user code
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
            },
        });
        if (!submission) {
            return;
        }
        let testCases;
        if (submission.type == "RUN") {
            testCases = await prisma.testCase.findMany({
                where: {
                    problemId: submission.problemId,
                    isSample: true,
                },
                select: {
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
                    input: true,
                    output: true,
                },
            });
        }
        const userCode = `${submission.code}`;
        const wrapped = `${userCode}
    const fs = require("fs");
    const args = JSON.parse(fs.readFileSync("/dev/stdin", "utf8"));
    const result = solve(...args)
    console.log(JSON.stringify(result))
    `;
        console.log("userCode: ", wrapped);
        console.log("testcases length: ", testCases.length);
        for (const tc of testCases) {
            console.log(JSON.stringify(tc));
            const cmd = `docker run --rm -i --memory="128m" --cpus="0.5" node:18 node -e '${wrapped}'`;
            const output = await new Promise((resolve, reject) => {
                const child = exec(cmd, {
                    timeout: 5000,
                }, (err, stdout) => {
                    if (err)
                        reject(err);
                    resolve(stdout.trim());
                });
                child.stdin?.write(tc.input);
                child.stdin?.end();
            });
            console.log("output: ", JSON.parse(output));
            console.log("tc.output: ", tc.output);
            const actual = JSON.parse(output);
            const expected = JSON.parse(tc.output);
            if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                console.log("FAILED");
                await prisma.submission.update({
                    where: {
                        id: submissionId,
                    },
                    data: {
                        status: "FAILED",
                    },
                });
                return;
            }
        }
        await prisma.submission.update({
            where: {
                id: submissionId,
            },
            data: {
                status: "PASSED",
            },
        });
        console.log("PASSED");
    }
    catch (err) {
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
//# sourceMappingURL=index.js.map