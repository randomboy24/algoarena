// // import * as db from "@repo/database";

// // // console.log(await db.prisma.user.findMany());

// // console.log(await db.prisma.user.findMany());

// //  function main() {
// //      return new Promise(function (res,rej)  {

// //      })
// // }

// async function main() {
//   const response = await fetch("https://jsonplaceholder.typicode.com/todos/1");
//   const data = await response.json();
//   console.log(data);
// }

// main();

import { exec } from "child_process";

const testCases = [
  { input: [3, 5], expected: 8 },
  { input: [10, 2], expected: 12 },
];

import { prisma } from "@repo/database";
import { Worker } from "bullmq";

const worker = new Worker(
  "submission-queue",
  async (job) => {
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
      const userCode = `function solve(n,m) { return n + m }`;
      const wrapped = `${userCode}
    const fs = require("fs");
    const args = JSON.parse(fs.readFileSync("/dev/stdin", "utf8"));
    const result = solve(...args)
    console.log(JSON.stringify(result))
    `;
      for (const tc of testCases) {
        const cmd = `docker run --rm -i node:18 node -e '${wrapped}'`;
        const output: string = await new Promise((resolve, reject) => {
          const child = exec(cmd, (err, stdout) => {
            if (err) reject(err);
            resolve(stdout.trim());
          });
          child.stdin?.write(JSON.stringify(tc.input));
          child.stdin?.end();
        });
        if (JSON.parse(output) !== tc.expected) {
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
    } catch (err) {
      await prisma.submission.update({
        where: {
          id: submissionId,
        },
        data: {
          status: "FAILED",
        },
      });
    }
  },
  {
    connection: {
      host: "localhost",
      port: 6379,
      maxRetriesPerRequest: null,
    },
  },
);

// await worker.run();
