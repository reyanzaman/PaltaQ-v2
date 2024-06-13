/*
  Warnings:

  - Added the required column `paltaQId` to the `Reports` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reports" ADD COLUMN     "paltaQId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Reports" ADD CONSTRAINT "Reports_paltaQId_fkey" FOREIGN KEY ("paltaQId") REFERENCES "PaltaQ"("id") ON DELETE CASCADE ON UPDATE CASCADE;
