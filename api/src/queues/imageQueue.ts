// src/queues/imageQueue.ts
import { Queue } from "bullmq";
import { redisConfig } from "../utils/redis";

export const imageQueue = new Queue("image-processing", {
  connection: redisConfig,
});