/*
  Warnings:

  - You are about to drop the column `colorCode` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ClassEnrollment" ADD COLUMN     "colorCode" TEXT NOT NULL DEFAULT '1f2937';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "colorCode";
