/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Classes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Classes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Classes_name_key" ON "Classes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Classes_code_key" ON "Classes"("code");
