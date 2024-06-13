/*
  Warnings:

  - You are about to drop the column `dislikes` on the `PaltaQ` table. All the data in the column will be lost.
  - You are about to drop the column `likes` on the `PaltaQ` table. All the data in the column will be lost.
  - Added the required column `paltaQId` to the `Dislikes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paltaQId` to the `Likes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Dislikes" ADD COLUMN     "paltaQId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Likes" ADD COLUMN     "paltaQId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PaltaQ" DROP COLUMN "dislikes",
DROP COLUMN "likes";

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_paltaQId_fkey" FOREIGN KEY ("paltaQId") REFERENCES "PaltaQ"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dislikes" ADD CONSTRAINT "Dislikes_paltaQId_fkey" FOREIGN KEY ("paltaQId") REFERENCES "PaltaQ"("id") ON DELETE CASCADE ON UPDATE CASCADE;
