/*
  Warnings:

  - Made the column `questionId` on table `PaltaQ` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PaltaQ" ALTER COLUMN "questionId" SET NOT NULL;
