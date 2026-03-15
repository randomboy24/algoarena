import { Queue } from "bullmq";
export const queue = new Queue("submission-queue", {
    connection: {
        host: "localhost",
        port: 6379,
    },
});
//# sourceMappingURL=index.js.map