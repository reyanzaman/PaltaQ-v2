/*
  Warnings:

  - A unique constraint covering the columns `[name,classId]` on the table `Topic` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Topic_name_classId_key" ON "Topic"("name", "classId");
