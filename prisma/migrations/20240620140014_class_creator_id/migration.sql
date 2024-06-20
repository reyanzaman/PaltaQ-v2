/*
  Warnings:

  - Added the required column `creatorId` to the `Classes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Classes" ADD COLUMN     "creatorId" TEXT NOT NULL;
