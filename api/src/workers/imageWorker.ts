import { Worker } from "bullmq";
import sharp from "sharp";
import { redisConfig } from "../utils/redis";
import { prisma } from "../prisma/client";

new Worker(
  "image-processing",
  async (job) => {
    const { threadId, imagePath } = job.data;
    if (!imagePath) return;

    const inputPath = `uploads/${imagePath}`;
    const outputPath = `uploads/processed-${imagePath}`;

    await sharp(inputPath).resize(800).jpeg({ quality: 80 }).toFile(outputPath);

    await prisma.threads.update({
      where: { id: threadId },
      data: { image: `processed-${imagePath}` },
    });
  },
  { connection: redisConfig }
);

console.log("Image worker running...");

