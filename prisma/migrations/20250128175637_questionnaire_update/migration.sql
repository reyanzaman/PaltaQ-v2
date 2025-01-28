/*
  Warnings:

  - You are about to drop the column `questionsAtAge4` on the `PostQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `questionsYesterday` on the `PostQuestionnaire` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PostQuestionnaire" DROP COLUMN "questionsAtAge4",
DROP COLUMN "questionsYesterday",
ADD COLUMN     "comments" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "questionsNow" TEXT NOT NULL DEFAULT '';
