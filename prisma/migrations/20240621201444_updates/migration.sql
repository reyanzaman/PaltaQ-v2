/*
  Warnings:

  - You are about to drop the column `rank` on the `UserDetails` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `UserDetails` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Dislikes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Likes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Reports` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ClassEnrollment" ADD COLUMN     "rank" TEXT NOT NULL DEFAULT 'Novice Inquirer',
ADD COLUMN     "score" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Dislikes" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Likes" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Reports" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "UserDetails" DROP COLUMN "rank",
DROP COLUMN "score",
ADD COLUMN     "totalScore" INTEGER NOT NULL DEFAULT 0;
