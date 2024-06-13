/*
  Warnings:

  - You are about to drop the column `pquestion` on the `PaltaQ` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `PaltaQ` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PaltaQ" DROP COLUMN "pquestion",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dislikes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "likes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "score" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
