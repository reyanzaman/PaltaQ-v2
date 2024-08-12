/*
  Warnings:

  - A unique constraint covering the columns `[classId]` on the table `PostQuestionnaire` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[classId]` on the table `PreQuestionnaire` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `classId` to the `PostQuestionnaire` table without a default value. This is not possible if the table is not empty.
  - Added the required column `classId` to the `PreQuestionnaire` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PostQuestionnaire" ADD COLUMN     "classId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PreQuestionnaire" ADD COLUMN     "classId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PostQuestionnaire_classId_key" ON "PostQuestionnaire"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "PreQuestionnaire_classId_key" ON "PreQuestionnaire"("classId");

-- AddForeignKey
ALTER TABLE "PreQuestionnaire" ADD CONSTRAINT "PreQuestionnaire_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ClassEnrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostQuestionnaire" ADD CONSTRAINT "PostQuestionnaire_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ClassEnrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
