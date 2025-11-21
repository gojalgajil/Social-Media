-- AlterTable
ALTER TABLE "Likes" ADD COLUMN     "reply_id" INTEGER,
ALTER COLUMN "thread_id" DROP NOT NULL;
