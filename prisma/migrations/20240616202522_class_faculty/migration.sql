/*
  Warnings:

  - The primary key for the `ClassEnrollment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `facultyId` on the `Classes` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,classId]` on the table `ClassEnrollment` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `ClassEnrollment` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `updatedAt` to the `ClassEnrollment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Classes" DROP CONSTRAINT "Classes_facultyId_fkey";

-- AlterTable
ALTER TABLE "ClassEnrollment" DROP CONSTRAINT "ClassEnrollment_pkey",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "ClassEnrollment_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Classes" DROP COLUMN "facultyId";

-- CreateTable
CREATE TABLE "ClassFaculty" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassFaculty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClassFaculty_classId_userId_key" ON "ClassFaculty"("classId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassEnrollment_userId_classId_key" ON "ClassEnrollment"("userId", "classId");

-- AddForeignKey
ALTER TABLE "ClassFaculty" ADD CONSTRAINT "ClassFaculty_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassFaculty" ADD CONSTRAINT "ClassFaculty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
