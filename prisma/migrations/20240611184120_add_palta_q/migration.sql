/*
  Warnings:

  - Added the required column `pquestion` to the `PaltaQ` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PaltaQ" ADD COLUMN     "pquestion" TEXT NOT NULL;
