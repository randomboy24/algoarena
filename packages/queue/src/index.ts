import { Queue } from "bullmq";

export const queue = new Queue("submission-queue", {
  connection: {
    host: "localhost",
    port: 6379,
    maxRetriesPerRequest: null,
  },
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  },
});
