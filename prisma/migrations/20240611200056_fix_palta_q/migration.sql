/*
  Warnings:

  - Added the required column `paltaQ` to the `PaltaQ` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PaltaQ" ADD COLUMN     "paltaQ" TEXT NOT NULL;
